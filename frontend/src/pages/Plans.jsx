import { useState, useEffect } from 'react';
import planService from '../services/planService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Plus, Check, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [form, setForm] = useState({
    name: '',
    price: '',
    billing_frequency: 'monthly',
    min_quantity: 1,
    availability_start: new Date().toISOString().split('T')[0],
    availability_end: '',
    auto_close_on_end: false,
    allow_early_close: true,
    allow_pause: true,
    allow_renewal: true,
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await planService.getAll();
      setPlans(data.results || data);
    } catch (err) {
      toast.error('Failed to load subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        availability_end: form.availability_end || null,
      };
      await planService.create(payload);
      toast.success('Subscription plan created.');
      setIsModalOpen(false);
      loadPlans();
    } catch (err) {
      toast.error('Error creating plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Plan Name',
      accessor: (p) => (
        <div>
          <div className="font-semibold text-gray-900">{p.name}</div>
          <div className="text-xs text-gray-400 capitalize">Min Qty: {p.min_quantity}</div>
        </div>
      ),
    },
    {
      header: 'Billing Frequency',
      accessor: (p) => (
        <span className="capitalize px-2.5 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 font-medium">
          {p.billing_frequency}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: (p) => <span className="font-bold text-gray-900">${Number(p.price).toFixed(2)}</span>,
    },
    {
      header: 'Lifecycle Rules',
      accessor: (p) => (
        <div className="flex items-center gap-2 text-xs">
          <span title="Allow Pause" className={`flex items-center gap-0.5 ${p.allow_pause ? 'text-green-600' : 'text-gray-400'}`}>
            Pause {p.allow_pause ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          </span>
          <span className="text-gray-200">|</span>
          <span title="Allow Renewal" className={`flex items-center gap-0.5 ${p.allow_renewal ? 'text-green-600' : 'text-gray-400'}`}>
            Renew {p.allow_renewal ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          </span>
          <span className="text-gray-200">|</span>
          <span title="Allow Early Close" className={`flex items-center gap-0.5 ${p.allow_early_close ? 'text-green-600' : 'text-gray-400'}`}>
            Early Close {p.allow_early_close ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          </span>
        </div>
      ),
    },
    {
      header: 'Start Date',
      accessor: (p) => (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {p.availability_start}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans"
        description="Establish recurring pricing tiers, billing cadences, and cancellation terms"
        action={
          isAdmin
            ? {
                label: 'Create Plan',
                icon: Plus,
                onClick: () => setIsModalOpen(true),
              }
            : null
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={plans} emptyMessage="No plans configured." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Subscription Plan">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <FormField label="Plan Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Growth Monthly"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Base Price ($)" required>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="199.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="Billing Frequency" required>
              <select
                value={form.billing_frequency}
                onChange={(e) => setForm({ ...form, billing_frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Availability Start" required>
              <input
                type="date"
                required
                value={form.availability_start}
                onChange={(e) => setForm({ ...form, availability_start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="Availability End (Optional)">
              <input
                type="date"
                value={form.availability_end}
                onChange={(e) => setForm({ ...form, availability_end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <FormField label="Minimum Quantity Required">
            <input
              type="number"
              min={1}
              value={form.min_quantity}
              onChange={(e) => setForm({ ...form, min_quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="p-3 bg-gray-50 rounded-xl space-y-2 border border-gray-200 text-xs">
            <p className="font-semibold text-gray-700">Lifecycle Permissions:</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_pause}
                onChange={(e) => setForm({ ...form, allow_pause: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Allow pausing subscription</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_renewal}
                onChange={(e) => setForm({ ...form, allow_renewal: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Allow renewing subscription</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_early_close}
                onChange={(e) => setForm({ ...form, allow_early_close: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Allow early customer termination / closing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.auto_close_on_end}
                onChange={(e) => setForm({ ...form, auto_close_on_end: e.target.checked })}
                className="rounded text-blue-600"
              />
              <span>Automatically close when end date arrives</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
