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
      accessor: (s) => <span className="font-semibold text-blue-700">{s.subscription_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (s) => (
        <div>
          <div className="font-medium text-slate-900">{s.customer_name || s.customer_email}</div>
          <div className="text-[11px] text-slate-400">{s.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (s) => <span className="text-slate-800 text-xs">{s.plan_name}</span>,
    },
    {
      header: 'Next Billing',
      accessor: (s) => <span className="text-xs text-slate-600">{s.next_billing_date || 'N/A'}</span>,
    },
    {
      header: 'Status',
      accessor: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Amount',
      accessor: (s) => <span className="font-semibold text-slate-900">${Number(s.total || 0).toFixed(2)}</span>,
    },
    {
      header: 'Actions',
      accessor: (s) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedSub(s)}
            className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded text-xs"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {isStaff && s.status === 'confirmed' && (
            <button
              onClick={() => handleAction(subscriptionService.activate, s.id, 'Subscription activated.')}
              disabled={actionLoading}
              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
              title="Activate"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && s.status === 'active' && (
            <button
              onClick={() => handleAction(subscriptionService.pause, s.id, 'Subscription paused.')}
              disabled={actionLoading}
              className="p-1 text-amber-700 hover:bg-amber-50 rounded"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && s.status === 'paused' && (
            <button
              onClick={() => handleAction(subscriptionService.resume, s.id, 'Subscription resumed.')}
              disabled={actionLoading}
              className="p-1 text-blue-700 hover:bg-blue-50 rounded"
              title="Resume"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && (s.status === 'active' || s.status === 'paused') && (
            <button
              onClick={() => handleAction(subscriptionService.close, s.id, 'Subscription closed.')}
              disabled={actionLoading}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
              title="Close"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}

          {isStaff && s.status === 'closed' && (
            <button
              onClick={() => handleAction(subscriptionService.renew, s.id, 'Subscription renewed.')}
              disabled={actionLoading}
              className="p-1 text-indigo-700 hover:bg-indigo-50 rounded"
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

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Customer</span>
                <span className="font-semibold text-slate-800">{selectedSub.customer_name || selectedSub.customer_email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Plan</span>
                <span className="font-semibold text-slate-800">{selectedSub.plan_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Start Date</span>
                <span className="font-semibold text-slate-800">{selectedSub.start_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Next Billing</span>
                <span className="font-semibold text-blue-700">{selectedSub.next_billing_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Terms</span>
                <span className="font-semibold text-slate-800">{selectedSub.payment_terms}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <StatusBadge status={selectedSub.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Products:</h4>
              <div className="border border-slate-200 rounded divide-y text-xs">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{line.product_name}</p>
                      <p className="text-slate-400 text-[11px]">
                        Qty: {line.quantity} × ${line.unit_price} (Tax: {line.tax_rate}%)
                      </p>
                    </div>
                    <span className="font-semibold text-slate-900">${line.line_total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t border-slate-200 pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${selectedSub.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span>${selectedSub.tax_total}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-100 pt-1">
                <span>Recurring Amount:</span>
                <span>${selectedSub.total}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {isStaff && selectedSub.status === 'confirmed' && (
                <button
                  onClick={() => handleAction(subscriptionService.activate, selectedSub.id, 'Subscription activated.')}
                  className="flex-1 py-1.5 bg-emerald-700 text-white rounded text-xs font-medium hover:bg-emerald-800 flex items-center justify-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" /> Activate
                </button>
              )}
              {isStaff && selectedSub.status === 'active' && (
                <button
                  onClick={() => handleAction(subscriptionService.pause, selectedSub.id, 'Subscription paused.')}
                  className="flex-1 py-1.5 bg-amber-700 text-white rounded text-xs font-medium hover:bg-amber-800 flex items-center justify-center gap-1"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}
              {isStaff && selectedSub.status === 'paused' && (
                <button
                  onClick={() => handleAction(subscriptionService.resume, selectedSub.id, 'Subscription resumed.')}
                  className="flex-1 py-1.5 bg-blue-700 text-white rounded text-xs font-medium hover:bg-blue-800 flex items-center justify-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              )}
              {isStaff && (selectedSub.status === 'active' || selectedSub.status === 'paused') && (
                <button
                  onClick={() => handleAction(subscriptionService.close, selectedSub.id, 'Subscription closed.')}
                  className="flex-1 py-1.5 bg-rose-700 text-white rounded text-xs font-medium hover:bg-rose-800 flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Close
                </button>
              )}
              {isStaff && selectedSub.status === 'closed' && (
                <button
                  onClick={() => handleAction(subscriptionService.renew, selectedSub.id, 'Subscription renewed.')}
                  className="flex-1 py-1.5 bg-indigo-700 text-white rounded text-xs font-medium hover:bg-indigo-800 flex items-center justify-center gap-1"
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
