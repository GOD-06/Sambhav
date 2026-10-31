import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import planService from '../services/planService';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadReceipt } from '../utils/receiptGenerator';
import {
  Eye,
  Zap,
  Check,
  CreditCard,
  ShieldCheck,
  Download,
  Building,
  Landmark,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  // Checkout modal states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    payment_method: 'credit_card',
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '888',
    cardName: 'Alex Customer',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, plansData] = await Promise.all([
        subscriptionService.getAll(),
        planService.getAll(),
      ]);
      setSubscriptions(subsData.results || subsData);
      setPlans(plansData.results || plansData);
    } catch (err) {
      toast.error('Failed to load subscription data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setPaymentSuccess(null);
    setCheckoutModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const res = await api.post('subscriptions/subscribe/', {
        plan_id: selectedPlan.id,
        payment_method: paymentForm.payment_method,
        note: `Online checkout for ${selectedPlan.name}`,
      });

      toast.success(`Subscribed to ${selectedPlan.name}`);
      setPaymentSuccess(res.data);
      // Reload subscriptions in background
      loadData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Subscription checkout failed.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getPackageFeatures = (planName) => {
    const name = (planName || '').toLowerCase();
    if (name.includes('starter') || name.includes('essentials')) {
      return [
        '1 Dedicated Core Instance',
        'Standard Support (24h response)',
        'Basic Container Runtime',
        '99.5% Uptime SLA',
      ];
    }
    if (name.includes('developer') || name.includes('sandbox')) {
      return [
        'Automated CI/CD Test Runners',
        '3 Isolated Dev Sandboxes',
        'Git Integration & Webhooks',
        'Community & Discord Support',
      ];
    }
    if (name.includes('collaboration') || name.includes('workspace')) {
      return [
        '10 Team Member Seats',
        'Real-Time Docs & Whiteboards',
        'Slack & Teams Integration',
        'Role-Based Project Boards',
      ];
    }
    if (name.includes('professional') || name.includes('automation')) {
      return [
        'Unlimited Automated Workflows',
        'Bi-Directional CRM Sync',
        'Priority Email & Chat Support',
        '99.9% High Availability SLA',
      ];
    }
    if (name.includes('ai') || name.includes('analytics') || name.includes('intelligence')) {
      return [
        'Predictive Revenue Forecasting',
        'Customer Churn Detection',
        'Custom KPI Dashboards',
        'Automated Executive Reports',
      ];
    }
    if (name.includes('growth')) {
      return [
        'Dedicated Cluster Architecture',
        'SOC2 & GDPR Compliance Tools',
        'Custom Audit Logs & SSO',
        'Dedicated Account Manager',
      ];
    }
    if (name.includes('cybershield') || name.includes('security') || name.includes('sentinel')) {
      return [
        'Real-Time Threat Detection',
        'Automated DDoS Protection',
        'Daily Vulnerability Scans',
        '24/7 Security Operations Center',
      ];
    }
    if (name.includes('gateway') || name.includes('api')) {
      return [
        '10 Million Monthly Requests',
        'Traffic Shaping & Rate Limiting',
        'Multi-Region Geo-Routing',
        'Sub-10ms Latency SLA',
      ];
    }
    if (name.includes('founder') || name.includes('annual')) {
      return [
        'All-Inclusive Annual Licensing',
        '2 Months Free Included',
        'Direct Technical Architect Access',
        'Custom Invoicing & PO Terms',
      ];
    }
    if (name.includes('global') || name.includes('scale')) {
      return [
        'Worldwide 28-Region Multi-Cluster',
        'Unlimited Throughput & Storage',
        '99.999% Fault-Tolerant SLA',
        'Dedicated Incident Response Team',
      ];
    }
    return [
      'Complete Software License',
      'Standard System Updates',
      'Email Technical Support',
      'Secure Cloud Backup',
    ];
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Subscriptions"
        description="Active software licenses, billing cycles, and available dummy packages to subscribe"
      />

      {/* Active Subscriptions Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-tight uppercase tracking-wider text-white/70">
            Active Subscriptions ({subscriptions.length})
          </h2>
        </div>

        {subscriptions.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-white">No active subscriptions yet</p>
            <p className="text-xs text-white/50 mt-1">
              Select one of the dummy software packages below to activate a license and test payment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white/[0.03] rounded-2xl border border-white/[0.08] hover:border-white/[0.16] p-5 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-medium text-[#A9B2FF] bg-[#A9B2FF]/10 px-2 py-0.5 rounded-md border border-[#A9B2FF]/20">
                      {sub.subscription_number}
                    </span>
                    <StatusBadge status={sub.status} />
                  </div>

                  <h3 className="text-base font-semibold text-white mt-2">{sub.plan_name}</h3>
                  <p className="text-2xl font-light font-mono text-white mt-1">
                    ${Number(sub.total).toFixed(2)}
                    <span className="text-xs font-normal text-white/40 ml-1.5 font-sans">/ cycle</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-white/40">Next Billing:</span>
                      <span className="text-[#E8FF1F]">{sub.next_billing_date || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Start Date:</span>
                      <span className="text-white/80">{sub.start_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Terms:</span>
                      <span className="text-white/80">{sub.payment_terms}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.08]">
                  <button
                    onClick={() => setSelectedSub(sub)}
                    className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 border border-white/[0.12] transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Dummy Packages to Subscribe */}
      <section className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#E8FF1F]/10 border border-[#E8FF1F]/30 flex items-center justify-center text-[#E8FF1F]">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Available Dummy Products & Packages
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Choose any dummy software tier to test customer self-checkout, automated billing, and receipt download.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 text-center">
            <p className="text-xs text-white/50">No packages available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isPro = plan.name.toLowerCase().includes('pro');
              const features = getPackageFeatures(plan.name);

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-5 flex flex-col justify-between transition ${
                    isPro
                      ? 'bg-white/[0.05] border-2 border-[#E8FF1F]'
                      : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8FF1F] text-black text-[10px] font-bold px-3 py-0.5 rounded-full font-mono uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {plan.product_name && (
                          <span className="text-[10px] font-mono font-medium text-[#A9B2FF] uppercase tracking-wider block mb-0.5">
                            {plan.product_name}
                          </span>
                        )}
                        <h3 className="text-base font-semibold text-white tracking-tight">{plan.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.08]">
                        {plan.billing_frequency}
                      </span>
                    </div>

                    <div className="my-4">
                      <span className="text-3xl font-light text-white font-mono tracking-tight">
                        ${Number(plan.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-white/40 ml-1.5 font-sans">
                        / {plan.billing_frequency === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <Check className="w-3.5 h-3.5 text-[#E8FF1F] shrink-0 mt-0.5" />
                          <span className="text-white/70">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/[0.08]">
                    <button
                      onClick={() => handleOpenCheckout(plan)}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isPro
                          ? 'bg-[#E8FF1F] hover:bg-[#d8ed17] text-black shadow-sm'
                          : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.12]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" /> Subscribe Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Subscription Details Modal */}
      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          title={`Subscription: ${selectedSub.subscription_number}`}
        >
          <div className="space-y-4">
            <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.08] grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Plan</span>
                <span className="font-semibold text-white">{selectedSub.plan_name}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Status</span>
                <StatusBadge status={selectedSub.status} />
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Next Renewal</span>
                <span className="font-mono text-[#E8FF1F]">{selectedSub.next_billing_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider">Amount</span>
                <span className="font-mono font-bold text-white">${selectedSub.total}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Licensed Products:</h4>
              <div className="divide-y divide-white/[0.04] border border-white/[0.08] rounded-xl text-xs">
                {selectedSub.lines?.map((line) => (
                  <div key={line.id} className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium text-white">{line.product_name}</span>
                      <span className="block text-[11px] text-white/40 font-mono">Qty: {line.quantity}</span>
                    </div>
                    <span className="font-mono text-white">${Number(line.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] rounded-lg text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Checkout & Payment Modal */}
      {checkoutModalOpen && selectedPlan && (
        <Modal
          isOpen={true}
          onClose={() => setCheckoutModalOpen(false)}
          title={paymentSuccess ? 'Payment Confirmed' : `Checkout: ${selectedPlan.name}`}
        >
          {paymentSuccess ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Subscription Activated</h3>
                <p className="text-xs text-white/50 mt-1">
                  Your payment has been settled and receipt recorded.
                </p>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 text-xs font-mono text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40">Subscription:</span>
                  <span className="text-white font-medium">{paymentSuccess.subscription_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Invoice:</span>
                  <span className="text-[#A9B2FF] font-medium">{paymentSuccess.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Amount Paid:</span>
                  <span className="text-emerald-400 font-bold">${Number(paymentSuccess.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Method:</span>
                  <span className="text-white/80 capitalize">{paymentSuccess.payment_method.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => downloadReceipt(paymentSuccess)}
                  className="flex-1 py-2.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Receipt
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutModalOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  Back to Subscriptions
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="bg-white/[0.02] border border-white/[0.08] p-3 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">{selectedPlan.name}</h4>
                  <p className="text-[11px] text-white/50 capitalize font-mono">{selectedPlan.billing_frequency} recurring plan</p>
                </div>
                <span className="text-base font-mono font-bold text-[#E8FF1F]">
                  ${Number(selectedPlan.price).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'credit_card' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      paymentForm.payment_method === 'credit_card'
                        ? 'border-[#E8FF1F] bg-[#E8FF1F]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/[0.16]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1.5 text-[#E8FF1F]" />
                    <span className="block text-xs font-medium">Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'bank_transfer' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      paymentForm.payment_method === 'bank_transfer'
                        ? 'border-[#E8FF1F] bg-[#E8FF1F]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/[0.16]'
                    }`}
                  >
                    <Building className="w-4 h-4 mb-1.5 text-[#A9B2FF]" />
                    <span className="block text-xs font-medium">Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, payment_method: 'net_banking' })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      paymentForm.payment_method === 'net_banking'
                        ? 'border-[#E8FF1F] bg-[#E8FF1F]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/[0.16]'
                    }`}
                  >
                    <Landmark className="w-4 h-4 mb-1.5 text-[#FFB37A]" />
                    <span className="block text-xs font-medium">NetBanking</span>
                  </button>
                </div>
              </div>

              {paymentForm.payment_method === 'credit_card' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-mono text-white/50 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                      className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-white/50 mb-1">Card Number (Simulated)</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white font-mono outline-none focus:border-[#E8FF1F]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-white/50 mb-1">Expiry</label>
                      <input
                        type="text"
                        required
                        value={paymentForm.cardExpiry}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardExpiry: e.target.value })}
                        className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white font-mono outline-none focus:border-[#E8FF1F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-white/50 mb-1">CVC</label>
                      <input
                        type="text"
                        required
                        value={paymentForm.cardCvc}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardCvc: e.target.value })}
                        className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white font-mono outline-none focus:border-[#E8FF1F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentForm.payment_method !== 'credit_card' && (
                <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-xs space-y-1 font-mono text-white/60">
                  <p>Bank: Dummy Gateway Sandbox</p>
                  <p>Account: 987654321098</p>
                  <p className="text-[#E8FF1F] pt-1">Simulated instant clearance enabled</p>
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="flex-1 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting ? 'Processing...' : `Pay $${Number(selectedPlan.price).toFixed(2)}`}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
