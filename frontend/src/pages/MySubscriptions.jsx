import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    subscriptionService
      .getAll()
      .then((data) => setSubscriptions(data.results || data))
      .catch(() => toast.error('Failed to load subscriptions.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Subscriptions"
        description="Active software licenses and billing cycles"
      />

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg p-10 text-center border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No active subscriptions</p>
          <p className="text-xs text-slate-500 mt-1">You currently have no subscribed plans.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {sub.subscription_number}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{sub.plan_name}</h3>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  ${Number(sub.total).toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ cycle</span>
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Billing:</span>
                    <span className="font-medium text-slate-800">{sub.next_billing_date || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date:</span>
                    <span className="font-medium text-slate-700">{sub.start_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terms:</span>
                    <span className="font-medium text-slate-700">{sub.payment_terms}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedSub(sub)}
                  className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded text-xs flex items-center justify-center gap-1 border border-slate-200 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          title={`Subscription: ${selectedSub.subscription_number}`}
        >
          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Plan</span>
                <span className="font-bold text-slate-800">{selectedSub.plan_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <StatusBadge status={selectedSub.status} />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Next Renewal</span>
                <span className="font-semibold text-blue-700">{selectedSub.next_billing_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Amount</span>
                <span className="font-bold text-slate-900">${selectedSub.total}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Licensed Products:</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded text-xs">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{line.product_name}</p>
                      <p className="text-slate-400 text-[11px]">Quantity: {line.quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-900">${line.line_total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
