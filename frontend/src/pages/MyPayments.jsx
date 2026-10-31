import { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
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
      accessor: (p) => <span className="font-semibold text-blue-700">{p.invoice_number}</span>,
    },
    {
      header: 'Date',
      accessor: (p) => <span className="text-xs text-slate-700">{p.payment_date}</span>,
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
      header: 'Reference',
      accessor: (p) => <span className="text-xs text-slate-500">{p.note || 'N/A'}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Payments"
        description="Payment history and credited transactions"
      />

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
