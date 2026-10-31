import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadReceipt } from '../utils/receiptGenerator';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService
      .getAll()
      .then((data) => setPayments(data.results || data))
      .catch(() => toast.error('Failed to load payments.'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: 'Invoice #',
      accessor: (p) => <span className="font-mono font-medium text-[#A9B2FF]">{p.invoice_number}</span>,
    },
    {
      header: 'Date',
      accessor: (p) => <span className="text-xs text-white/70 font-mono">{p.payment_date}</span>,
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
      header: 'Reference',
      accessor: (p) => <span className="text-xs text-white/40">{p.note || 'N/A'}</span>,
    },
    {
      header: 'Receipt',
      accessor: (p) => (
        <button
          onClick={() => downloadReceipt(p)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.06] hover:bg-[#E8FF1F] text-white hover:text-black border border-white/[0.12] rounded-lg text-xs font-mono font-medium transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Payments"
        description="Payment history, credited transactions, and downloadable official receipts"
      />

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={payments} emptyMessage="No payment records found." />
        )}
      </div>
    </div>
  );
}
