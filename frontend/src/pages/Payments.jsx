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
      accessor: (p) => <span className="font-semibold text-blue-700">{p.invoice_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (p) => (
        <div>
          <div className="font-medium text-slate-900">{p.customer_name || p.customer_email}</div>
          <div className="text-[11px] text-slate-400">{p.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (p) => <span className="font-semibold text-emerald-800">${Number(p.amount).toFixed(2)}</span>,
    },
    {
      header: 'Method',
      accessor: (p) => (
        <span className="capitalize px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700 font-medium">
          {p.payment_method_display || p.payment_method.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: (p) => <span className="text-xs text-slate-600">{p.payment_date}</span>,
    },
    {
      header: 'Note',
      accessor: (p) => <span className="text-xs text-slate-500">{p.note || 'N/A'}</span>,
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

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            >
              <option value="">Select invoice...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoice_number} - {inv.customer_name || inv.customer_email} (Due: ${Number(inv.outstanding_amount || inv.total).toFixed(2)})
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
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="Method" required>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
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
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <FormField label="Note">
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 bg-emerald-700 text-white rounded text-xs font-medium hover:bg-emerald-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
