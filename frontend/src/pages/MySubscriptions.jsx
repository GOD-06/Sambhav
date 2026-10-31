import { useState, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Repeat, Calendar, CheckCircle, Package, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    subscriptionService
      .getAll()
      .then((data) => setSubscriptions(data.results || data))
      .catch(() => toast.error('Failed to load your subscriptions.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Subscriptions"
        description="View your active software services, plan terms, and upcoming renewal billing dates"
      />

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No active subscriptions</h3>
          <p className="text-sm text-gray-500 mt-1">You do not currently have any subscribed services.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition duration-150"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {sub.subscription_number}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>

                <h3 className="text-lg font-bold text-gray-900">{sub.plan_name}</h3>
                <p className="text-2xl font-black text-gray-900 mt-2">
                  ${Number(sub.total).toFixed(2)}
                  <span className="text-xs font-normal text-gray-400 ml-1">/ cycle</span>
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Next Billing Date:</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      {sub.next_billing_date || '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Start Date:</span>
                    <span className="font-medium text-gray-700">{sub.start_date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Payment Terms:</span>
                    <span className="font-medium text-gray-700">{sub.payment_terms}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t">
                <button
                  onClick={() => setSelectedSub(sub)}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" /> View Plan Details
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
          title={`Subscription Details: ${selectedSub.subscription_number}`}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block">Plan:</span>
                <span className="font-bold text-gray-800">{selectedSub.plan_name}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Status:</span>
                <StatusBadge status={selectedSub.status} />
              </div>
              <div>
                <span className="text-gray-400 block">Next Renewal:</span>
                <span className="font-semibold text-blue-600">{selectedSub.next_billing_date || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Recurring Total:</span>
                <span className="font-bold text-gray-900">${selectedSub.total}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Licensed Software Lines:</h4>
              <div className="divide-y border rounded-xl text-xs">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{line.product_name}</p>
                      <p className="text-gray-400 text-[11px]">Quantity: {line.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-900">${line.line_total}</span>
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
