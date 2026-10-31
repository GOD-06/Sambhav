import { useState, useEffect } from 'react';
import discountService from '../services/discountService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Percent, Plus, Tag, Calendar, CheckCircle2, XCircle } from 'lucide-react';
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
      toast.success('Discount rule created successfully.');
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
          <div className="font-semibold text-gray-900">{d.name}</div>
          <div className="text-xs text-gray-400">
            {d.apply_to_whole_subscription ? 'Applies to whole subscription' : 'Per eligible product'}
          </div>
        </div>
      ),
    },
    {
      header: 'Discount',
      accessor: (d) => (
        <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">
          {d.discount_type === 'percentage' ? `${d.value}% OFF` : `$${d.value} OFF`}
        </span>
      ),
    },
    {
      header: 'Validity Period',
      accessor: (d) => (
        <span className="text-xs text-gray-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {d.start_date} {d.end_date ? `to ${d.end_date}` : '(No expiry)'}
        </span>
      ),
    },
    {
      header: 'Usage',
      accessor: (d) => (
        <span className="text-xs text-gray-700">
          {d.times_used} / {d.usage_limit || '∞'} used
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (d) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${d.is_valid_now ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {d.is_valid_now ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {d.is_valid_now ? 'Active' : 'Expired / Exhausted'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotional Discounts"
        description="Configure fixed or percentage pricing reductions, minimum thresholds, and usage caps"
        action={
          isAdmin
            ? {
                label: 'New Discount Rule',
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
          <DataTable columns={columns} data={discounts} emptyMessage="No discount rules configured." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Discount Rule">
        <form onSubmit={handleCreateDiscount} className="space-y-4">
          <FormField label="Discount Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Early Bird Promo 15%"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Discount Type" required>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </FormField>

            <FormField label="Value" required help={form.discount_type === 'percentage' ? 'e.g. 15 for 15%' : 'e.g. 50 for $50'}>
              <input
                type="number"
                step="0.01"
                required
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min Purchase Amount ($)">
              <input
                type="number"
                step="0.01"
                value={form.min_purchase_amount}
                onChange={(e) => setForm({ ...form, min_purchase_amount: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
              />
            </FormField>

            <FormField label="Usage Limit">
              <input
                type="number"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                placeholder="e.g. 100 times"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="End Date">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
              />
            </FormField>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={form.apply_to_whole_subscription}
              onChange={(e) => setForm({ ...form, apply_to_whole_subscription: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Apply discount to entire invoice total (otherwise individual line items)</span>
          </label>

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
              {submitting ? 'Creating...' : 'Save Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
