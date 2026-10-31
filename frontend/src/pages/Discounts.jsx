import { useState, useEffect } from 'react';
import discountService from '../services/discountService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [form, setForm] = useState({
    name: '',
    discount_type: 'percentage',
    value: '',
    min_purchase_amount: '',
    min_quantity: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    usage_limit: '',
    apply_to_whole_subscription: true,
  });

  const loadDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountService.getAll();
      setDiscounts(data.results || data);
    } catch (err) {
      toast.error('Failed to load discount rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        min_purchase_amount: form.min_purchase_amount || null,
        min_quantity: form.min_quantity || null,
        end_date: form.end_date || null,
        usage_limit: form.usage_limit || null,
      };
      await discountService.create(payload);
      toast.success('Discount rule created.');
      setIsModalOpen(false);
      loadDiscounts();
    } catch (err) {
      toast.error('Error creating discount rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Rule Name',
      accessor: (d) => (
        <div>
          <div className="font-semibold text-slate-900">{d.name}</div>
          <div className="text-[11px] text-slate-500">
            {d.apply_to_whole_subscription ? 'Whole subscription' : 'Per line item'}
          </div>
        </div>
      ),
    },
    {
      header: 'Value',
      accessor: (d) => (
        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-200">
          {d.discount_type === 'percentage' ? `${d.value}%` : `$${d.value}`}
        </span>
      ),
    },
    {
      header: 'Validity',
      accessor: (d) => (
        <span className="text-xs text-slate-600">
          {d.start_date} to {d.end_date || 'Ongoing'}
        </span>
      ),
    },
    {
      header: 'Usage',
      accessor: (d) => (
        <span className="text-xs text-slate-600">
          {d.times_used} / {d.usage_limit || 'Unlimited'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (d) => (
        <span className={`px-2 py-0.5 text-xs rounded font-medium border ${d.is_valid_now ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {d.is_valid_now ? 'Active' : 'Expired'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Discount Rules"
        description="Promotion rules, percentage discounts, and eligibility caps"
        action={
          isAdmin
            ? {
                label: 'Create Rule',
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
          <DataTable columns={columns} data={discounts} emptyMessage="No discount rules configured." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Discount Rule">
        <form onSubmit={handleCreateDiscount} className="space-y-3">
          <FormField label="Rule Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type" required>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </FormField>

            <FormField label="Value" required>
              <input
                type="number"
                step="0.01"
                required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min Purchase ($)">
              <input
                type="number"
                step="0.01"
                value={form.min_purchase_amount}
                onChange={(e) => setForm({ ...form, min_purchase_amount: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="Usage Limit">
              <input
                type="number"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="End Date">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={form.apply_to_whole_subscription}
              onChange={(e) => setForm({ ...form, apply_to_whole_subscription: e.target.checked })}
              className="rounded"
            />
            <span>Apply to whole subscription</span>
          </label>

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
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
