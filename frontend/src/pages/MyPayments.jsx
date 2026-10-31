import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { CreditCard, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService
      .getAll()
      .then((data) => setPayments(data.results || data))
      .catch(() => toast.error('Failed to load your payment records.'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: 'Invoice #',
      accessor: (p) => <span className="font-semibold text-blue-600">{p.invoice_number}</span>,
    },
    {
      header: 'Payment Date',
      accessor: (p) => (
        <span className="text-xs text-gray-700 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {p.payment_date}
        </span>
      ),
    },
    {
      header: 'Amount Paid',
      accessor: (p) => <span className="font-bold text-green-700">${Number(p.amount).toFixed(2)}</span>,
    },
    {
      header: 'Payment Method',
      accessor: (p) => (
        <span className="capitalize px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">
          {p.payment_method_display || p.payment_method.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Note / Ref',
      accessor: (p) => <span className="text-xs text-gray-500">{p.note || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payment History"
        description="Verify recorded payments, wire transfers, and receipts credited to your account"
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={payments} emptyMessage="No payment records found on your account." />
        )}
      </div>
    </div>
  );
}
