import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, RotateCcw, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { role } = useAuth();
  const isStaff = role === 'admin' || role === 'staff';

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAll();
      setSubscriptions(data.results || data);
    } catch (err) {
      toast.error('Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleAction = async (actionFn, subId, successMsg) => {
    try {
      setActionLoading(true);
      const res = await actionFn(subId);
      toast.success(res.message || successMsg);
      loadSubscriptions();
      if (selectedSub && selectedSub.id === subId) {
        setSelectedSub(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Subscription #',
      accessor: (s) => <span className="font-mono font-medium text-[#A9B2FF]">{s.subscription_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (s) => (
        <div>
          <div className="font-medium text-white">{s.customer_name || s.customer_email}</div>
          <div className="text-[11px] text-white/50 font-mono">{s.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (s) => <span className="text-white/80 text-xs">{s.plan_name}</span>,
    },
    {
      header: 'Next Billing',
      accessor: (s) => <span className="text-xs text-white/60 font-mono">{s.next_billing_date || 'N/A'}</span>,
    },
    {
      header: 'Status',
      accessor: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Amount',
      accessor: (s) => <span className="font-mono font-medium text-white">${Number(s.total || 0).toFixed(2)}</span>,
    },
    {
      header: 'Actions',
      accessor: (s) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedSub(s)}
            className="p-1 text-white/50 hover:text-white hover:bg-white/[0.08] rounded-md transition cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {isStaff && s.status === 'confirmed' && (
            <button
              onClick={() => handleAction(subscriptionService.activate, s.id, 'Subscription activated.')}
              disabled={actionLoading}
              className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded-md transition cursor-pointer"
              title="Activate"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && s.status === 'active' && (
            <button
              onClick={() => handleAction(subscriptionService.pause, s.id, 'Subscription paused.')}
              disabled={actionLoading}
              className="p-1 text-[#FFB37A] hover:bg-amber-500/10 rounded-md transition cursor-pointer"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && s.status === 'paused' && (
            <button
              onClick={() => handleAction(subscriptionService.resume, s.id, 'Subscription resumed.')}
              disabled={actionLoading}
              className="p-1 text-[#A9B2FF] hover:bg-sky-500/10 rounded-md transition cursor-pointer"
              title="Resume"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && (s.status === 'active' || s.status === 'paused') && (
            <button
              onClick={() => handleAction(subscriptionService.close, s.id, 'Subscription closed.')}
              disabled={actionLoading}
              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
              title="Close"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && s.status === 'closed' && (
            <button
              onClick={() => handleAction(subscriptionService.renew, s.id, 'Subscription renewed.')}
              disabled={actionLoading}
              className="p-1 text-purple-400 hover:bg-purple-500/10 rounded-md transition cursor-pointer"
              title="Renew"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Subscriptions"
        description="Active agreements, recurrence intervals, and lifecycle states"
      />

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={subscriptions} emptyMessage="No subscriptions found." />
        )}
      </div>

      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          title={`Subscription ${selectedSub.subscription_number}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.08]">
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Customer</span>
                <span className="font-medium text-white">{selectedSub.customer_name || selectedSub.customer_email}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Plan</span>
                <span className="font-medium text-white">{selectedSub.plan_name}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Start Date</span>
                <span className="font-mono text-white/80">{selectedSub.start_date}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Next Billing</span>
                <span className="font-mono text-[#E8FF1F]">{selectedSub.next_billing_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Terms</span>
                <span className="text-white/80">{selectedSub.payment_terms}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Status</span>
                <StatusBadge status={selectedSub.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Products:</h4>
              <div className="border border-white/[0.08] rounded-xl divide-y divide-white/[0.04] text-xs">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{line.product_name}</p>
                      <p className="text-white/40 text-[11px] font-mono">
                        Qty: {line.quantity} * ${line.unit_price} (Tax: {line.tax_rate}%)
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-white">${line.line_total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t border-white/[0.08] pt-3 font-mono">
              <div className="flex justify-between text-white/60">
                <span>Subtotal:</span>
                <span>${selectedSub.subtotal}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Tax:</span>
                <span>${selectedSub.tax_total}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm border-t border-white/[0.08] pt-2">
                <span>Recurring Amount:</span>
                <span>${selectedSub.total}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/[0.08]">
              {isStaff && selectedSub.status === 'confirmed' && (
                <button
                  onClick={() => handleAction(subscriptionService.activate, selectedSub.id, 'Subscription activated.')}
                  className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Activate
                </button>
              )}
              {isStaff && selectedSub.status === 'active' && (
                <button
                  onClick={() => handleAction(subscriptionService.pause, selectedSub.id, 'Subscription paused.')}
                  className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[#FFB37A] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}
              {isStaff && selectedSub.status === 'paused' && (
                <button
                  onClick={() => handleAction(subscriptionService.resume, selectedSub.id, 'Subscription resumed.')}
                  className="flex-1 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-[#A9B2FF] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              )}
              {isStaff && (selectedSub.status === 'active' || selectedSub.status === 'paused') && (
                <button
                  onClick={() => handleAction(subscriptionService.close, selectedSub.id, 'Subscription closed.')}
                  className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Close
                </button>
              )}
              {isStaff && selectedSub.status === 'closed' && (
                <button
                  onClick={() => handleAction(subscriptionService.renew, selectedSub.id, 'Subscription renewed.')}
                  className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Renew
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
