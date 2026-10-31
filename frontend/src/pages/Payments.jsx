import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import invoiceService from '../services/invoiceService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'staff';

  const [form, setForm] = useState({
    invoice: '',
    amount: '',
    payment_method: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [payData, invData] = await Promise.all([
        paymentService.getAll(),
        invoiceService.getAll(),
      ]);
      setPayments(payData.results || payData);
      setInvoices((invData.results || invData).filter((i) => i.status !== 'paid' && i.status !== 'cancelled'));
    } catch (err) {
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInvoiceSelect = (invId) => {
    const inv = invoices.find((i) => i.id === parseInt(invId));
    setForm({
      ...form,
      invoice: invId,
      amount: inv ? (inv.outstanding_amount || inv.total) : '',
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentService.create(form);
      toast.success('Payment recorded.');
      setIsModalOpen(false);
      setForm({ invoice: '', amount: '', payment_method: 'bank_transfer', payment_date: new Date().toISOString().split('T')[0], note: '' });
      loadData();
    } catch (err) {
      toast.error('Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: (p) => <span className="font-mono font-medium text-[#A9B2FF]">{p.invoice_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (p) => (
        <div>
          <div className="font-medium text-white">{p.customer_name || p.customer_email}</div>
          <div className="text-[11px] text-white/50 font-mono">{p.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (p) => <span className="font-mono font-semibold text-emerald-400">${Number(p.amount).toFixed(2)}</span>,
    },
    {
      header: 'Method',
      accessor: (p) => (
        <span className="capitalize px-2 py-0.5 text-xs rounded-md bg-white/[0.06] border border-white/[0.1] text-white/80 font-mono">
          {p.payment_method_display || p.payment_method.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: (p) => <span className="text-xs text-white/60 font-mono">{p.payment_date}</span>,
    },
    {
      header: 'Note',
      accessor: (p) => <span className="text-xs text-white/40">{p.note || 'N/A'}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payments"
        description="Recorded transactions and settlement receipts"
        action={
          isStaff
            ? {
                label: 'Record Payment',
                icon: Plus,
                onClick: () => setIsModalOpen(true),
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
          <DataTable columns={columns} data={payments} emptyMessage="No payments recorded." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} className="space-y-3">
          <FormField label="Invoice" required>
            <select
              required
              value={form.invoice}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            >
              <option value="">Select invoice...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} | {inv.customer_name || inv.customer_email} (Due: ${Number(inv.outstanding_amount || inv.total).toFixed(2)})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount ($)" required>
              <input
                type="number"
                step="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
              />
            </FormField>

            <FormField label="Method" required>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>

          <FormField label="Payment Date" required>
            <input
              type="date"
              required
              value={form.payment_date}
              onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
            />
          </FormField>

          <FormField label="Note">
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
