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
import { Plus, Eye, Check } from 'lucide-react';
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
      toast.error('Failed to load quotations.');
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
      toast.success('Quotation created.');
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
      toast.success(res.message || 'Quotation accepted.');
      loadData();
      setSelectedQuotation(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept quotation.');
    }
  };

  const columns = [
    {
      header: 'Quotation #',
      accessor: (q) => <span className="font-mono font-medium text-[#A9B2FF]">{q.quotation_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (q) => (
        <div>
          <div className="font-medium text-white">{q.customer_name || q.customer_email}</div>
          <div className="text-[11px] text-white/50 font-mono">{q.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (q) => <span className="text-white/70 text-xs">{q.plan_name}</span>,
    },
    {
      header: 'Status',
      accessor: (q) => <StatusBadge status={q.status} />,
    },
    {
      header: 'Valid Until',
      accessor: (q) => <span className="text-xs text-white/50 font-mono">{q.valid_until}</span>,
    },
    {
      header: 'Total',
      accessor: (q) => <span className="font-mono font-medium text-white">${Number(q.total || 0).toFixed(2)}</span>,
    },
    {
      header: 'Actions',
      accessor: (q) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedQuotation(q)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/[0.08] rounded-md text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
          {q.status !== 'accepted' && (
            <button
              onClick={() => handleAcceptQuotation(q.id)}
              className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md text-xs font-mono font-medium border border-emerald-500/30 flex items-center gap-1 transition cursor-pointer"
            >
              <Check className="w-3 h-3" /> Accept
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quotations"
        description="Customer price quotes and subscription proposals"
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

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={quotations} emptyMessage="No quotations recorded." />
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Quotation">
        <form onSubmit={handleCreateQuotation} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Customer" required>
              <select
                required
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.email}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Plan" required>
              <select
                required
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
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
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="border border-white/[0.08] rounded-xl p-3 bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Line Items</span>
              <button
                type="button"
                onClick={addLine}
                className="text-xs text-[#E8FF1F] font-semibold hover:underline cursor-pointer"
              >
                + Add Item
              </button>
            </div>

            {form.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white/[0.04] p-2 rounded-lg border border-white/[0.08]">
                <div className="col-span-6">
                  <select
                    required
                    value={line.product}
                    onChange={(e) => handleLineProductChange(idx, e.target.value)}
                    className="w-full px-2 py-1.5 border border-white/[0.12] bg-white/[0.05] rounded text-xs text-white outline-none"
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
                    className="w-full px-2 py-1.5 border border-white/[0.12] bg-white/[0.05] rounded text-xs text-white outline-none font-mono"
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-3 text-right text-xs font-mono font-medium text-white">
                  ${(line.unit_price * line.quantity).toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="text-white/40 hover:text-rose-400 text-xs transition cursor-pointer"
                  >
                    ✕
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
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3.5 py-1.5 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {selectedQuotation && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedQuotation(null)}
          title={`Quotation ${selectedQuotation.quotation_number}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.08]">
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Customer</span>
                <span className="font-medium text-white">{selectedQuotation.customer_name || selectedQuotation.customer_email}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Plan</span>
                <span className="font-medium text-white">{selectedQuotation.plan_name}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Valid Until</span>
                <span className="font-mono text-white/80">{selectedQuotation.valid_until}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Status</span>
                <StatusBadge status={selectedQuotation.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Line Items:</h4>
              <div className="border border-white/[0.08] rounded-xl divide-y divide-white/[0.04] text-xs">
                {selectedQuotation.lines?.map((line) => (
                  <div key={line.id} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{line.product_name}</p>
                      <p className="text-white/40 text-[11px] font-mono">Qty: {line.quantity} * ${line.unit_price}</p>
                    </div>
                    <span className="font-mono font-semibold text-white">${line.line_total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t border-white/[0.08] pt-3 font-mono">
              <div className="flex justify-between text-white/60">
                <span>Subtotal:</span>
                <span>${selectedQuotation.subtotal}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Tax:</span>
                <span>${selectedQuotation.tax_total}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm border-t border-white/[0.08] pt-2">
                <span>Total:</span>
                <span>${selectedQuotation.total}</span>
              </div>
            </div>

            {selectedQuotation.status !== 'accepted' && (
              <div className="pt-2">
                <button
                  onClick={() => handleAcceptQuotation(selectedQuotation.id)}
                  className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Accept Quotation
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
