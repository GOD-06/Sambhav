import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  Repeat,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Eye,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
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
      accessor: (s) => <span className="font-semibold text-blue-600">{s.subscription_number}</span>,
    },
    {
      header: 'Customer',
      accessor: (s) => (
        <div>
          <div className="font-medium text-gray-900">{s.customer_name || s.customer_email}</div>
          <div className="text-xs text-gray-400">{s.customer_email}</div>
        </div>
      ),
    },
    {
      header: 'Plan',
      accessor: (s) => <span className="text-gray-800 text-xs font-semibold">{s.plan_name}</span>,
    },
    {
      header: 'Next Billing',
      accessor: (s) => (
        <span className="text-xs text-gray-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {s.next_billing_date || '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: 'Amount',
      accessor: (s) => <span className="font-bold text-gray-900">${Number(s.total || 0).toFixed(2)}</span>,
    },
    {
      header: 'Lifecycle Actions',
      accessor: (s) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedSub(s)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {isStaff && s.status === 'confirmed' && (
            <button
              onClick={() => handleAction(subscriptionService.activate, s.id, 'Subscription activated!')}
              disabled={actionLoading}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
              title="Activate Subscription"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          {isStaff && s.status === 'active' && (
            <button
              onClick={() => handleAction(subscriptionService.pause, s.id, 'Subscription paused.')}
              disabled={actionLoading}
              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
              title="Pause Subscription"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {isStaff && s.status === 'paused' && (
            <button
              onClick={() => handleAction(subscriptionService.resume, s.id, 'Subscription resumed.')}
              disabled={actionLoading}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Resume Subscription"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          {isStaff && (s.status === 'active' || s.status === 'paused') && (
            <button
              onClick={() => handleAction(subscriptionService.close, s.id, 'Subscription closed.')}
              disabled={actionLoading}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
              title="Close Subscription"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          {isStaff && s.status === 'closed' && (
            <button
              onClick={() => handleAction(subscriptionService.renew, s.id, 'Subscription renewed.')}
              disabled={actionLoading}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
              title="Renew Subscription"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Subscriptions"
        description="Monitor lifecycle stages, recurring billing dates, and subscription status transitions"
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={subscriptions} emptyMessage="No subscriptions found." />
        )}
      </div>

      {/* Subscription Detail Modal */}
      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          title={`Subscription ${selectedSub.subscription_number}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 block">Customer:</span>
                <span className="font-semibold text-gray-800">{selectedSub.customer_name || selectedSub.customer_email}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Plan:</span>
                <span className="font-semibold text-gray-800">{selectedSub.plan_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Start Date:</span>
                <span className="font-semibold text-gray-800">{selectedSub.start_date}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Next Billing Date:</span>
                <span className="font-semibold text-blue-600">{selectedSub.next_billing_date || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Payment Terms:</span>
                <span className="font-semibold text-gray-800">{selectedSub.payment_terms}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Status:</span>
                <StatusBadge status={selectedSub.status} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Included Products:</h4>
              <div className="border rounded-xl divide-y text-xs">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{line.product_name}</p>
                      <p className="text-gray-400 text-[11px]">
                        Qty: {line.quantity} × ${line.unit_price} (Tax: {line.tax_rate}%)
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">${line.line_total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${selectedSub.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>${selectedSub.tax_total}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-sm border-t pt-1">
                <span>Recurring Amount:</span>
                <span>${selectedSub.total}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap gap-2 pt-3 border-t">
              {isStaff && selectedSub.status === 'confirmed' && (
                <button
                  onClick={() => handleAction(subscriptionService.activate, selectedSub.id, 'Subscription activated!')}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Activate
                </button>
              )}
              {isStaff && selectedSub.status === 'active' && (
                <button
                  onClick={() => handleAction(subscriptionService.pause, selectedSub.id, 'Subscription paused.')}
                  className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 flex items-center justify-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}
              {isStaff && selectedSub.status === 'paused' && (
                <button
                  onClick={() => handleAction(subscriptionService.resume, selectedSub.id, 'Subscription resumed.')}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              )}
              {isStaff && (selectedSub.status === 'active' || selectedSub.status === 'paused') && (
                <button
                  onClick={() => handleAction(subscriptionService.close, selectedSub.id, 'Subscription closed.')}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" /> Close
                </button>
              )}
              {isStaff && selectedSub.status === 'closed' && (
                <button
                  onClick={() => handleAction(subscriptionService.renew, selectedSub.id, 'Subscription renewed.')}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center justify-center gap-1.5"
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
