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
  Play,
  Check,
  Send,
  XCircle,
  Printer,
  CreditCard,
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
      toast.success('Invoice marked as sent.');
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
      toast.success('Payment recorded.');
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
      loadInvoices();
    } catch (err) {
      toast.error('Failed to record payment.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: (inv) => <span className="font-semibold text-blue-700">{inv.invoice_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (inv) => (
        <div>
          <div className="font-medium text-slate-900">{inv.customer_name || inv.customer_email}</div>
          <div className="text-[11px] text-slate-400">{inv.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Subscription',
      accessor: (inv) => <span className="text-xs text-slate-600">{inv.subscription_number || 'Direct'}</span>,
    },
    {
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs text-slate-600">{inv.due_date}</span>,
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="font-semibold text-slate-900">${Number(inv.total).toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: 'Outstanding',
      accessor: (inv) => (
        <span className={`text-xs font-semibold ${Number(inv.outstanding_amount) > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
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
            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {isStaff && inv.status === 'draft' && (
            <button
              onClick={() => handleConfirm(inv.id)}
              className="p-1 text-blue-700 hover:bg-blue-50 rounded"
              title="Confirm Invoice"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && (inv.status === 'draft' || inv.status === 'confirmed') && (
            <button
              onClick={() => handleSend(inv.id)}
              className="p-1 text-slate-700 hover:bg-slate-100 rounded"
              title="Mark Sent"
            >
              <Send className="w-3.5 h-3.5" />
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
              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
              title="Record Payment"
            >
              <CreditCard className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && inv.status !== 'paid' && inv.status !== 'cancelled' && (
            <button
              onClick={() => handleCancel(inv.id)}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
              title="Cancel Invoice"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        description="Billing records, balances, and payment status"
        action={
          isStaff
            ? {
                label: generating ? 'Running...' : 'Run Billing Batch',
                icon: Play,
                onClick: handleGenerateInvoices,
              }
            : null
        }
      />

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={invoices} emptyMessage="No invoices found." />
        )}
      </div>

      {selectedInvoice && !isPaymentModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoice_number}`}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Brightloop Software Inc.</h3>
                <p className="text-xs text-slate-500">billing@brightloop.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-blue-700 block">{selectedInvoice.invoice_number}</span>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Billed To</span>
                <span className="font-semibold text-slate-800">{selectedInvoice.customer_name || selectedInvoice.customer_email}</span>
                <span className="text-slate-500 block">{selectedInvoice.customer_email}</span>
              </div>
              <div className="text-right">
                <div><span className="text-slate-400">Issue Date:</span> <span className="font-medium text-slate-800">{selectedInvoice.issue_date}</span></div>
                <div><span className="text-slate-400">Due Date:</span> <span className="font-medium text-rose-700">{selectedInvoice.due_date}</span></div>
                {selectedInvoice.subscription_number && (
                  <div><span className="text-slate-400">Subscription:</span> <span className="font-medium text-slate-800">{selectedInvoice.subscription_number}</span></div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Line Items:</h4>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-1.5">Item</th>
                    <th className="p-1.5 text-center">Qty</th>
                    <th className="p-1.5 text-right">Price</th>
                    <th className="p-1.5 text-right">Tax</th>
                    <th className="p-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.lines?.map((line) => (
                    <tr key={line.id}>
                      <td className="p-1.5 font-medium text-slate-800">{line.description || line.product_name}</td>
                      <td className="p-1.5 text-center text-slate-600">{line.quantity}</td>
                      <td className="p-1.5 text-right text-slate-600">${Number(line.unit_price).toFixed(2)}</td>
                      <td className="p-1.5 text-right text-slate-600">{line.tax_rate}%</td>
                      <td className="p-1.5 text-right font-semibold text-slate-900">${Number(line.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right space-y-1 text-xs border-t border-slate-200 pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${Number(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span>-${Number(selectedInvoice.discount_total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes:</span>
                <span>${Number(selectedInvoice.tax_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-100 pt-1">
                <span>Total:</span>
                <span>${Number(selectedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-700">
                <span>Paid:</span>
                <span>${Number(selectedInvoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-rose-700 border-t border-slate-100 pt-1">
                <span>Balance Due:</span>
                <span>${Number(selectedInvoice.outstanding_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              {isStaff && selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Record Payment
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment: ${selectedInvoice?.invoice_number || ''}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-3">
          <FormField label="Amount ($)" required>
            <input
              type="number"
              step="0.01"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <FormField label="Method" required>
            <select
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
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
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <FormField label="Reference Note">
            <input
              type="text"
              value={paymentForm.note}
              onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-medium hover:bg-emerald-800"
            >
              Save Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
