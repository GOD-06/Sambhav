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
  Calendar,
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
      toast.error('Failed to load dashboard statistics.');
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
      toast.success(res.message || 'Billing run completed.');
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invoice generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance & Subscription Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time performance and billing status across Brightloop</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateInvoices}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {generating ? 'Running Billing...' : 'Run Billing Batch'}
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          label="Outstanding Amount"
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

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Revenue Growth Trend</h2>
            <p className="text-xs text-gray-500">Recorded payments history over recent billing cycles</p>
          </div>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Real-time Aggregations
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.revenue_chart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E5E7EB' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Section: Overdue Invoices & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Invoices */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Overdue Invoices</h3>
                <p className="text-xs text-gray-500">Requires follow-up</p>
              </div>
            </div>
            <Link to="/invoices?status=overdue" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {stats?.overdue_invoices?.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                No overdue invoices. All clear!
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400">
                    <th className="pb-2 font-medium">Invoice</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Due Date</th>
                    <th className="pb-2 font-medium text-right">Owed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.overdue_invoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-medium text-blue-600">
                        <Link to={`/invoices`}>{inv.invoice_number}</Link>
                      </td>
                      <td className="py-2.5 text-gray-700">{inv.customer_name || inv.customer_email}</td>
                      <td className="py-2.5 text-red-600 font-medium">{inv.due_date}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
                        ${Number(inv.outstanding || inv.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Recent Invoices</h3>
                <p className="text-xs text-gray-500">Latest generated bills</p>
              </div>
            </div>
            <Link to="/invoices" className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {stats?.recent_invoices?.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                No invoices recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400">
                    <th className="pb-2 font-medium">Invoice</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.recent_invoices?.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 font-medium text-blue-600">
                        <Link to={`/invoices`}>{inv.invoice_number}</Link>
                      </td>
                      <td className="py-2.5 text-gray-700">{inv.customer_name || inv.customer_email}</td>
                      <td className="py-2.5">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
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
