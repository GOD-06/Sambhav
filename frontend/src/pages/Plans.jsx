import { useState, useEffect } from 'react';
import planService from '../services/planService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
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
      toast.error('Failed to load plans.');
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
          <div className="font-semibold text-slate-900">{p.name}</div>
          <div className="text-[11px] text-slate-500">Min Qty: {p.min_quantity}</div>
        </div>
      ),
    },
    {
      header: 'Frequency',
      accessor: (p) => (
        <span className="capitalize px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700 font-medium">
          {p.billing_frequency}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: (p) => <span className="font-semibold text-slate-900">${Number(p.price).toFixed(2)}</span>,
    },
    {
      header: 'Rules',
      accessor: (p) => (
        <span className="text-xs text-slate-600">
          Pause: {p.allow_pause ? 'Yes' : 'No'} | Renew: {p.allow_renewal ? 'Yes' : 'No'} | Early Close: {p.allow_early_close ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Start Date',
      accessor: (p) => <span className="text-xs text-slate-500">{p.availability_start}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Subscription Plans"
        description="Billing intervals, recurring pricing, and renewal policies"
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

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={plans} emptyMessage="No plans configured." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Plan">
        <form onSubmit={handleCreatePlan} className="space-y-3">
          <FormField label="Plan Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
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
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="Frequency" required>
              <select
                value={form.billing_frequency}
                onChange={(e) => setForm({ ...form, billing_frequency: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required>
              <input
                type="date"
                required
                value={form.availability_start}
                onChange={(e) => setForm({ ...form, availability_start: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="End Date (Optional)">
              <input
                type="date"
                value={form.availability_end}
                onChange={(e) => setForm({ ...form, availability_end: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <FormField label="Minimum Quantity">
            <input
              type="number"
              min={1}
              value={form.min_quantity}
              onChange={(e) => setForm({ ...form, min_quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5">
            <p className="font-semibold text-slate-700 text-[11px]">Lifecycle Settings:</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_pause}
                onChange={(e) => setForm({ ...form, allow_pause: e.target.checked })}
                className="rounded"
              />
              <span>Allow pausing subscription</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_renewal}
                onChange={(e) => setForm({ ...form, allow_renewal: e.target.checked })}
                className="rounded"
              />
              <span>Allow renewal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_early_close}
                onChange={(e) => setForm({ ...form, allow_early_close: e.target.checked })}
                className="rounded"
              />
              <span>Allow early cancellation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.auto_close_on_end}
                onChange={(e) => setForm({ ...form, auto_close_on_end: e.target.checked })}
                className="rounded"
              />
              <span>Auto close when end date arrives</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 bg-blue-700 text-white rounded text-xs font-medium hover:bg-blue-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
