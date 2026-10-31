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
          <div className="font-semibold text-white">{d.name}</div>
          <div className="text-[11px] text-white/50">
            {d.apply_to_whole_subscription ? 'Whole subscription' : 'Per line item'}
          </div>
        </div>
      ),
    },
    {
      header: 'Value',
      accessor: (d) => (
        <span className="font-mono font-medium text-[#E8FF1F] bg-[#E8FF1F]/10 px-2 py-0.5 rounded-md text-xs border border-[#E8FF1F]/20">
          {d.discount_type === 'percentage' ? `${d.value}%` : `$${d.value}`}
        </span>
      ),
    },
    {
      header: 'Validity',
      accessor: (d) => (
        <span className="text-xs text-white/70 font-mono">
          {d.start_date} to {d.end_date || 'Ongoing'}
        </span>
      ),
    },
    {
      header: 'Usage',
      accessor: (d) => (
        <span className="text-xs text-white/60 font-mono">
          {d.times_used} / {d.usage_limit || 'Unlimited'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (d) => (
        <span className={`px-2 py-0.5 text-xs rounded-md font-mono font-medium border ${d.is_valid_now ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.06] text-white/50 border-white/[0.12]'}`}>
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

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
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
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type" required>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
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
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
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
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
              />
            </FormField>

            <FormField label="Usage Limit">
              <input
                type="number"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
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
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
              />
            </FormField>

            <FormField label="End Date">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
              />
            </FormField>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70 hover:text-white py-1">
            <input
              type="checkbox"
              checked={form.apply_to_whole_subscription}
              onChange={(e) => setForm({ ...form, apply_to_whole_subscription: e.target.checked })}
              className="rounded accent-[#E8FF1F]"
            />
            <span>Apply to whole subscription</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-1.5 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
