import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import planService from '../services/planService';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadReceipt } from '../utils/receiptGenerator';
import { Check, CreditCard, ShieldCheck, Zap, Download, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Packages() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const navigate = useNavigate();

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await planService.getAll();
      setPlans(data.results || data);
    } catch (err) {
      toast.error('Failed to load subscription packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Packages"
        description="Select a dummy package to subscribe and test client self-checkout"
      />

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white/[0.03] rounded-2xl p-12 text-center border border-white/[0.08]">
          <p className="text-white font-medium">No subscription packages found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isPro = plan.name.toLowerCase().includes('pro');
            const features = getPackageFeatures(plan.name);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition ${
                  isPro
                    ? 'bg-white/[0.05] border-2 border-[#E8FF1F] shadow-lg'
                    : 'bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8FF1F] text-black text-[10px] font-bold px-3 py-0.5 rounded-full font-mono uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
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

                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-light text-white font-mono tracking-tight">
                      ${Number(plan.price).toFixed(2)}
                    </span>
                    <span className="text-xs text-white/40 ml-1.5 font-sans">
                      / {plan.billing_frequency === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-white/[0.08]">
                    {features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-[#E8FF1F] shrink-0 mt-0.5" />
                        <span className="text-white/70">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.08]">
                  <button
                    onClick={() => handleOpenCheckout(plan)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isPro
                        ? 'bg-[#E8FF1F] hover:bg-[#d8ed17] text-black shadow-sm'
                        : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/[0.12]'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" /> Subscribe Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
                    navigate('/my-subscriptions');
                  }}
                  className="flex-1 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  View Subscriptions <ArrowRight className="w-3.5 h-3.5" />
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
                <label className="block text-xs font-semibold text-white/70 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'credit_card', label: 'Credit Card' },
                    { id: 'bank_transfer', label: 'Bank Wire' },
                    { id: 'cash', label: 'Instant Net' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, payment_method: m.id })}
                      className={`py-2 px-2.5 rounded-lg text-xs font-mono font-medium border text-center transition cursor-pointer ${
                        paymentForm.payment_method === m.id
                          ? 'border-[#E8FF1F] bg-[#E8FF1F]/10 text-white'
                          : 'border-white/[0.1] bg-white/[0.03] text-white/60 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {paymentForm.payment_method === 'credit_card' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        required
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white font-mono outline-none focus:border-[#E8FF1F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        required
                        value={paymentForm.cardExpiry}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardExpiry: e.target.value })}
                        className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white font-mono outline-none focus:border-[#E8FF1F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1">CVC Security</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={paymentForm.cardCvc}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardCvc: e.target.value })}
                        className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white font-mono outline-none focus:border-[#E8FF1F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                      className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-white/[0.08] pt-3 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-white/50">
                  <span>Subtotal:</span>
                  <span>${Number(selectedPlan.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Taxes:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-white/[0.08]">
                  <span>Total Due Today:</span>
                  <span className="text-[#E8FF1F]">${Number(selectedPlan.price).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCheckoutModalOpen(false)}
                  className="px-3.5 py-1.5 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer shadow-sm"
                >
                  {submitting ? 'Processing...' : `Pay $${Number(selectedPlan.price).toFixed(2)} Now`}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

