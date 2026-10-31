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
      accessor: (inv) => <span className="font-mono font-medium text-[#A9B2FF]">{inv.invoice_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (inv) => (
        <div>
          <div className="font-medium text-white">{inv.customer_name || inv.customer_email}</div>
          <div className="text-[11px] text-white/50 font-mono">{inv.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Subscription',
      accessor: (inv) => <span className="text-xs text-white/70 font-mono">{inv.subscription_number || 'Direct'}</span>,
    },
    {
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs text-white/60 font-mono">{inv.due_date}</span>,
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="font-mono font-medium text-white">${Number(inv.total).toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: 'Outstanding',
      accessor: (inv) => (
        <span className={`text-xs font-mono font-medium ${Number(inv.outstanding_amount) > 0 ? 'text-[#FFB37A]' : 'text-emerald-400'}`}>
          ${Number(inv.outstanding_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (inv) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedInvoice(inv)}
            className="p-1.5 text-white/50 hover:text-white hover:bg-white/[0.08] rounded-md transition cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {isStaff && inv.status === 'draft' && (
            <button
              onClick={() => handleConfirm(inv.id)}
              className="p-1.5 text-[#A9B2FF] hover:bg-sky-500/10 rounded-md transition cursor-pointer"
              title="Confirm Invoice"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && (inv.status === 'draft' || inv.status === 'confirmed') && (
            <button
              onClick={() => handleSend(inv.id)}
              className="p-1.5 text-white/70 hover:bg-white/[0.08] rounded-md transition cursor-pointer"
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
              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-md transition cursor-pointer"
              title="Record Payment"
            >
              <CreditCard className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && inv.status !== 'paid' && inv.status !== 'cancelled' && (
            <button
              onClick={() => handleCancel(inv.id)}
              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
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

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
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
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Subscription Management System Inc.</h3>
                <p className="text-xs text-white/50">billing@subscriptionmanagement.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-[#A9B2FF] block">{selectedInvoice.invoice_number}</span>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.08]">
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Billed To</span>
                <span className="font-medium text-white">{selectedInvoice.customer_name || selectedInvoice.customer_email}</span>
                <span className="text-white/50 block font-mono mt-0.5">{selectedInvoice.customer_email}</span>
              </div>
              <div className="text-right font-mono">
                <div><span className="text-white/40">Issue Date:</span> <span className="text-white/80">{selectedInvoice.issue_date}</span></div>
                <div><span className="text-white/40">Due Date:</span> <span className="text-[#FFB37A]">{selectedInvoice.due_date}</span></div>
                {selectedInvoice.subscription_number && (
                  <div><span className="text-white/40">Subscription:</span> <span className="text-white/80">{selectedInvoice.subscription_number}</span></div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Line Items:</h4>
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.04] text-white/50 border-b border-white/[0.08]">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Tax</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-white/80 font-mono">
                  {selectedInvoice.lines?.map((line) => (
                    <tr key={line.id}>
                      <td className="p-2 font-sans font-medium text-white">{line.description || line.product_name}</td>
                      <td className="p-2 text-center text-white/70">{line.quantity}</td>
                      <td className="p-2 text-right text-white/70">${Number(line.unit_price).toFixed(2)}</td>
                      <td className="p-2 text-right text-white/70">{line.tax_rate}%</td>
                      <td className="p-2 text-right font-semibold text-white">${Number(line.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right space-y-1 text-xs border-t border-white/[0.08] pt-3 font-mono">
              <div className="flex justify-between text-white/60">
                <span>Subtotal:</span>
                <span>${Number(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Discount:</span>
                <span>-${Number(selectedInvoice.discount_total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Taxes:</span>
                <span>${Number(selectedInvoice.tax_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm border-t border-white/[0.08] pt-2">
                <span>Total:</span>
                <span>${Number(selectedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-emerald-400">
                <span>Paid:</span>
                <span>${Number(selectedInvoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#FFB37A] border-t border-white/[0.08] pt-1">
                <span>Balance Due:</span>
                <span>${Number(selectedInvoice.outstanding_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              {isStaff && selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="flex-1 py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
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
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
            />
          </FormField>

          <FormField label="Method" required>
            <select
              value={paymentForm.payment_method}
              onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
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
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
            />
          </FormField>

          <FormField label="Reference Note">
            <input
              type="text"
              value={paymentForm.note}
              onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-3.5 py-1.5 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs transition cursor-pointer"
            >
              Save Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
