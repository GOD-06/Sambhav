import { useState, useEffect } from 'react';
import quotationService from '../services/quotationService';
import customerService from '../services/customerService';
import planService from '../services/planService';
import productService from '../services/productService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { FileBarChart, Plus, CheckCircle, Eye, Calendar, User, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'staff';

  const [form, setForm] = useState({
    customer: '',
    plan: '',
    valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
    lines: [
      { product: '', quantity: 1, unit_price: 0, tax_rate: 20 },
    ],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [qData, cData, pData, prodData] = await Promise.all([
        quotationService.getAll(),
        customerService.getAll(),
        planService.getAll(),
        productService.getAll(),
      ]);
      setQuotations(qData.results || qData);
      setCustomers(cData.results || cData);
      setPlans(pData.results || pData);
      setProducts(prodData.results || prodData);
    } catch (err) {
      toast.error('Failed to load quotation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLineProductChange = (index, productId) => {
    const prod = products.find((p) => p.id === parseInt(productId));
    const newLines = [...form.lines];
    newLines[index].product = productId;
    if (prod) {
      newLines[index].unit_price = parseFloat(prod.sales_price);
    }
    setForm({ ...form, lines: newLines });
  };

  const handleLineQtyChange = (index, qty) => {
    const newLines = [...form.lines];
    newLines[index].quantity = parseInt(qty) || 1;
    setForm({ ...form, lines: newLines });
  };

  const addLine = () => {
    setForm({
      ...form,
      lines: [...form.lines, { product: '', quantity: 1, unit_price: 0, tax_rate: 20 }],
    });
  };

  const removeLine = (index) => {
    if (form.lines.length <= 1) return;
    setForm({
      ...form,
      lines: form.lines.filter((_, i) => i !== index),
    });
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await quotationService.create(form);
      toast.success('Quotation draft created successfully.');
      setIsCreateModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Error creating quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptQuotation = async (id) => {
    try {
      const res = await quotationService.accept(id);
      toast.success(res.message || 'Quotation accepted into confirmed subscription!');
      loadData();
      setSelectedQuotation(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept quotation.');
    }
  };

  const columns = [
    {
      header: 'Quotation #',
      accessor: (q) => <span className="font-semibold text-blue-600">{q.quotation_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (q) => (
        <div>
          <div className="font-medium text-gray-900">{q.customer_name || q.customer_email}</div>
          <div className="text-xs text-gray-400">{q.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (q) => <span className="text-gray-700 text-xs font-medium">{q.plan_name}</span>,
    },
    {
      header: 'Status',
      accessor: (q) => <StatusBadge status={q.status} />,
    },
    {
      header: 'Valid Until',
      accessor: (q) => <span className="text-xs text-gray-500">{q.valid_until}</span>,
    },
    {
      header: 'Total',
      accessor: (q) => <span className="font-bold text-gray-900">${Number(q.total || 0).toFixed(2)}</span>,
    },
    {
      header: 'Actions',
      accessor: (q) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedQuotation(q)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs flex items-center gap-1"
          >
            <Eye className="w-4 h-4" /> View
          </button>
          {q.status !== 'accepted' && (
            <button
              onClick={() => handleAcceptQuotation(q.id)}
              className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Accept
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Quotations"
        description="Draft, distribute, and convert customized software quotes into recurring subscriptions"
        action={
          isStaff
            ? {
                label: 'Create Quotation',
                icon: Plus,
                onClick: () => setIsCreateModalOpen(true),
              }
            : null
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={quotations} emptyMessage="No quotations recorded." />
        )}
      </div>

      {/* Create Quotation Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Draft New Quotation">
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Customer" required>
              <select
                required
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.email} ({c.company_name || 'Individual'})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Subscription Plan" required>
              <select
                required
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price} / {p.billing_frequency})
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Valid Until" required>
            <input
              type="date"
              required
              value={form.valid_until}
              onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          {/* Line Items */}
          <div className="border rounded-xl p-3 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Quotation Line Items</span>
              <button type="button" onClick={addLine} className="text-xs text-blue-600 font-medium hover:underline">
                + Add Item
              </button>
            </div>

            {form.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-gray-200">
                <div className="col-span-6">
                  <select
                    required
                    value={line.product}
                    onChange={(e) => handleLineProductChange(idx, e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
                  >
                    <option value="">Select product...</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (${prod.sales_price})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => handleLineQtyChange(idx, e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs"
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-3 text-right text-xs font-semibold text-gray-700">
                  ${(line.unit_price * line.quantity).toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  <button type="button" onClick={() => removeLine(idx)} className="text-red-500 text-xs hover:text-red-700">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <FormField label="Notes">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Terms, validity clauses, add-on terms..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Quotation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quotation Detail Modal */}
      {selectedQuotation && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuotation(null)}
          title={`Quotation ${selectedQuotation.quotation_number}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 block">Customer:</span>
                <span className="font-semibold text-gray-800">{selectedQuotation.customer_name || selectedQuotation.customer_email}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Plan:</span>
                <span className="font-semibold text-gray-800">{selectedQuotation.plan_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Valid Until:</span>
                <span className="font-semibold text-gray-800">{selectedQuotation.valid_until}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Status:</span>
                <StatusBadge status={selectedQuotation.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Quotation Lines:</h4>
              <div className="border rounded-xl divide-y text-xs">
                {selectedQuotation.lines?.map((line) => (
                  <div key={line.id} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{line.product_name}</p>
                      <p className="text-gray-400 text-[11px]">
                        Qty: {line.quantity} × ${line.unit_price}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">${line.line_total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${selectedQuotation.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax:</span>
                <span>${selectedQuotation.tax_total}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-sm border-t pt-1">
                <span>Total:</span>
                <span>${selectedQuotation.total}</span>
              </div>
            </div>

            {selectedQuotation.status !== 'accepted' && (
              <div className="pt-2">
                <button
                  onClick={() => handleAcceptQuotation(selectedQuotation.id)}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Accept Quotation & Generate Subscription
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
