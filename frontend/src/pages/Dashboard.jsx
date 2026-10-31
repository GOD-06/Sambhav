import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import invoiceService from '../services/invoiceService';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Repeat,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  Play,
  FileText,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleGenerateInvoices = async () => {
    try {
      setGenerating(true);
      const res = await invoiceService.generateInvoices();
      toast.success(res.message || 'Billing batch completed.');
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invoice generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500">Subscription and financial overview</p>
        </div>
        <div>
          <button
            onClick={handleGenerateInvoices}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {generating ? 'Processing...' : 'Run Billing Batch'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Subscriptions"
          value={stats?.active_subscriptions_count || 0}
          icon={Repeat}
          color="blue"
        />
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          label="Outstanding Balance"
          value={`$${(stats?.total_outstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Overdue Invoices"
          value={stats?.overdue_invoices_count || 0}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-slate-900">Revenue History</h2>
          <p className="text-xs text-slate-500">Recorded collections by month</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.revenue_chart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} fill="#dbeafe" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Overdue Invoices</h3>
            <Link to="/invoices" className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {stats?.overdue_invoices?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No overdue invoices.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-2 font-medium">Invoice</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Due</th>
                    <th className="pb-2 font-medium text-right">Owed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stats?.overdue_invoices?.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2 font-medium text-blue-700">{inv.invoice_number}</td>
                      <td className="py-2 text-slate-800">{inv.customer_name || inv.customer_email}</td>
                      <td className="py-2 text-rose-700 font-medium">{inv.due_date}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">
                        ${Number(inv.outstanding || inv.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Invoices</h3>
            <Link to="/invoices" className="text-xs text-blue-700 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {stats?.recent_invoices?.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No invoices recorded.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-2 font-medium">Invoice</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stats?.recent_invoices?.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2 font-medium text-blue-700">{inv.invoice_number}</td>
                      <td className="py-2 text-slate-800">{inv.customer_name || inv.customer_email}</td>
                      <td className="py-2">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-2 text-right font-semibold text-slate-900">
                        ${Number(inv.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
