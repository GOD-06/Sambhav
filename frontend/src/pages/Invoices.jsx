import { useState, useEffect } from 'react';
import invoiceService from '../services/invoiceService';
import paymentService from '../services/paymentService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Play,
  Check,
  Send,
  XCircle,
  Printer,
  CreditCard,
  DollarSign,
  Calendar,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'staff';

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll();
      setInvoices(data.results || data);
    } catch (err) {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleGenerateInvoices = async () => {
    try {
      setGenerating(true);
      const res = await invoiceService.generateInvoices();
      toast.success(res.message || 'Billing batch completed.');
      loadInvoices();
    } catch (err) {
      toast.error('Billing run failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await invoiceService.confirm(id);
      toast.success('Invoice confirmed.');
      loadInvoices();
    } catch (err) {
      toast.error('Failed to confirm invoice.');
    }
  };

  const handleSend = async (id) => {
    try {
      await invoiceService.sendInvoice(id);
      toast.success('Invoice marked as sent to customer.');
      loadInvoices();
    } catch (err) {
      toast.error('Failed to send invoice.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await invoiceService.cancel(id);
      toast.success('Invoice cancelled.');
      loadInvoices();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel invoice.');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await paymentService.create({
        invoice: selectedInvoice.id,
        amount: paymentForm.amount,
        payment_method: paymentForm.payment_method,
        payment_date: paymentForm.payment_date,
        note: paymentForm.note,
      });
      toast.success('Payment recorded successfully.');
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
      loadInvoices();
    } catch (err) {
      toast.error('Failed to record payment.');
    }
  };

  const handlePrint = (invoice) => {
    window.print();
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: (inv) => <span className="font-semibold text-blue-600">{inv.invoice_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (inv) => (
        <div>
          <div className="font-medium text-gray-900">{inv.customer_name || inv.customer_email}</div>
          <div className="text-xs text-gray-400">{inv.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Subscription',
      accessor: (inv) => <span className="text-xs text-gray-600">{inv.subscription_number || 'Direct Order'}</span>,
    },
    {
      header: 'Due Date',
      accessor: (inv) => (
        <span className="text-xs text-gray-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {inv.due_date}
        </span>
      ),
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="font-bold text-gray-900">${Number(inv.total).toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: 'Outstanding',
      accessor: (inv) => (
        <span className={`text-xs font-semibold ${Number(inv.outstanding_amount) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
          ${Number(inv.outstanding_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (inv) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedInvoice(inv)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {isStaff && inv.status === 'draft' && (
            <button
              onClick={() => handleConfirm(inv.id)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
              title="Confirm Invoice"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {isStaff && (inv.status === 'draft' || inv.status === 'confirmed') && (
            <button
              onClick={() => handleSend(inv.id)}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
              title="Send to Customer"
            >
              <Send className="w-4 h-4" />
            </button>
          )}

          {isStaff && inv.status !== 'paid' && inv.status !== 'cancelled' && (
            <button
              onClick={() => {
                setSelectedInvoice(inv);
                setPaymentForm({
                  ...paymentForm,
                  amount: inv.outstanding_amount || inv.total,
                });
                setIsPaymentModalOpen(true);
              }}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
              title="Record Payment"
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}

          {isStaff && inv.status !== 'paid' && inv.status !== 'cancelled' && (
            <button
              onClick={() => handleCancel(inv.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
              title="Cancel Invoice"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & Recurring Billing"
        description="Review generated invoices, track payments, send reminders, and execute billing batches"
        action={
          isStaff
            ? {
                label: generating ? 'Running Batch...' : 'Run Billing Batch',
                icon: Play,
                onClick: handleGenerateInvoices,
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
          <DataTable columns={columns} data={invoices} emptyMessage="No invoices generated yet." />
        )}
      </div>

      {/* Invoice Detail & Print Modal */}
      {selectedInvoice && !isPaymentModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoice_number}`}
        >
          <div className="space-y-4 print:p-8" id="printable-invoice">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Brightloop Software Inc.</h3>
                <p className="text-xs text-gray-500">100 Innovation Way, Tech Park</p>
                <p className="text-xs text-gray-500">billing@brightloop.com</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-gray-400 block">INVOICE</span>
                <span className="text-base font-bold text-blue-600">{selectedInvoice.invoice_number}</span>
                <div className="mt-1">
                  <StatusBadge status={selectedInvoice.status} />
                </div>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 block">Billed To:</span>
                <span className="font-semibold text-gray-800">{selectedInvoice.customer_name || selectedInvoice.customer_email}</span>
                <span className="text-gray-500 block">{selectedInvoice.customer_email}</span>
              </div>
              <div className="text-right">
                <div><span className="text-gray-400">Issue Date:</span> <span className="font-medium text-gray-800">{selectedInvoice.issue_date}</span></div>
                <div><span className="text-gray-400">Due Date:</span> <span className="font-medium text-red-600">{selectedInvoice.due_date}</span></div>
                {selectedInvoice.subscription_number && (
                  <div><span className="text-gray-400">Subscription:</span> <span className="font-medium text-gray-800">{selectedInvoice.subscription_number}</span></div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Itemized Breakdown:</h4>
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2 rounded-l">Item Description</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">Tax</th>
                    <th className="p-2 text-right rounded-r">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedInvoice.lines?.map((line) => (
                    <tr key={line.id}>
                      <td className="p-2 font-medium text-gray-800">{line.description || line.product_name}</td>
                      <td className="p-2 text-center text-gray-600">{line.quantity}</td>
                      <td className="p-2 text-right text-gray-600">${Number(line.unit_price).toFixed(2)}</td>
                      <td className="p-2 text-right text-gray-600">{line.tax_rate}%</td>
                      <td className="p-2 text-right font-semibold text-gray-900">${Number(line.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="text-right space-y-1 text-xs border-t pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${Number(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount Total:</span>
                <span>-${Number(selectedInvoice.discount_total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes:</span>
                <span>${Number(selectedInvoice.tax_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-sm border-t pt-1">
                <span>Total Amount:</span>
                <span>${Number(selectedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-green-700">
                <span>Paid to Date:</span>
                <span>${Number(selectedInvoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-red-600 border-t pt-1">
                <span>Balance Due:</span>
                <span>${Number(selectedInvoice.outstanding_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => handlePrint(selectedInvoice)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Invoice
              </button>
              {isStaff && selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Record Payment
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.invoice_number}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <FormField label="Amount ($)" required>
            <input
              type="number"
              step="0.01"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <FormField label="Payment Method" required>
            <select
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </FormField>

          <FormField label="Payment Date" required>
            <input
              type="date"
              required
              value={paymentForm.payment_date}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <FormField label="Note / Reference">
            <input
              type="text"
              value={paymentForm.note}
              onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
              placeholder="e.g. Wire transfer ref WT-9012"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
