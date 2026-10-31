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
  TrendingUp,
  Zap,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-xs text-white/50 mt-0.5">Real-time subscription and billing overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/packages"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8FF1F]/10 hover:bg-[#E8FF1F]/20 border border-[#E8FF1F]/30 text-[#E8FF1F] rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            Subscribe Packages
          </Link>
          <Link
            to="/finance-bento"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] text-white rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#E8FF1F]" />
            Bento Component View
          </Link>
          <button
            onClick={handleGenerateInvoices}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-black text-black" />
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

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Revenue Stream</h2>
            <p className="text-xs text-white/50">Recorded collections from live transactions</p>
          </div>
          <span className="text-xs font-mono text-[#E8FF1F] bg-[#E8FF1F]/10 px-2.5 py-1 rounded-md border border-[#E8FF1F]/20">
            Live Ledger
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.revenue_chart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#0E0E10',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#ffffff',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#E8FF1F"
                strokeWidth={2}
                fill="rgba(232, 255, 31, 0.08)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Overdue Invoices</h3>
            <Link to="/invoices" className="text-xs text-[#E8FF1F] hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {stats?.overdue_invoices?.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                No overdue invoices.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-white/40">
                    <th className="pb-2 font-medium">Invoice</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Due</th>
                    <th className="pb-2 font-medium text-right">Owed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-white/80">
                  {stats?.overdue_invoices?.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 font-mono text-[#A9B2FF]">{inv.invoice_number}</td>
                      <td className="py-2.5 text-white/90">{inv.customer_name || inv.customer_email}</td>
                      <td className="py-2.5 text-[#FFB37A] font-mono">{inv.due_date}</td>
                      <td className="py-2.5 text-right font-mono font-medium text-white">
                        ${Number(inv.outstanding || inv.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.08]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Invoices</h3>
            <Link to="/invoices" className="text-xs text-[#E8FF1F] hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {stats?.recent_invoices?.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                No invoices recorded.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-white/40">
                    <th className="pb-2 font-medium">Invoice</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-white/80">
                  {stats?.recent_invoices?.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 font-mono text-[#A9B2FF]">{inv.invoice_number}</td>
                      <td className="py-2.5 text-white/90">{inv.customer_name || inv.customer_email}</td>
                      <td className="py-2.5">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-white">
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
