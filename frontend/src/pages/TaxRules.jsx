import { useState, useEffect } from 'react';
import taxRuleService from '../services/taxRuleService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaxRules() {
  const [taxRules, setTaxRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [form, setForm] = useState({
    name: '',
    rate: '',
    is_active: true,
  });

  const loadTaxRules = async () => {
    try {
      setLoading(true);
      const data = await taxRuleService.getAll();
      setTaxRules(data.results || data);
    } catch (err) {
      toast.error('Failed to load tax rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxRules();
  }, []);

  const handleCreateTaxRule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await taxRuleService.create(form);
      toast.success('Tax rule created.');
      setIsModalOpen(false);
      setForm({ name: '', rate: '', is_active: true });
      loadTaxRules();
    } catch (err) {
      toast.error('Failed to create tax rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Tax Name',
      accessor: (t) => <span className="font-semibold text-white">{t.name}</span>,
    },
    {
      header: 'Rate (%)',
      accessor: (t) => (
        <span className="font-mono font-medium text-[#E8FF1F] bg-[#E8FF1F]/10 px-2 py-0.5 rounded-md text-xs border border-[#E8FF1F]/20">
          {t.rate}%
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (t) => (
        <span className={`px-2 py-0.5 text-xs rounded-md font-mono font-medium border ${t.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.06] text-white/50 border-white/[0.12]'}`}>
          {t.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created Date',
      accessor: (t) => <span className="text-xs text-white/50 font-mono">{t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tax Rules"
        description="Tax percentages applied to invoice line items"
        action={
          isAdmin
            ? {
                label: 'Add Tax Rule',
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
          <DataTable columns={columns} data={taxRules} emptyMessage="No tax rules configured." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Tax Rule">
        <form onSubmit={handleCreateTaxRule} className="space-y-3">
          <FormField label="Tax Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <FormField label="Rate (%)" required help="e.g. 20.00 for 20%">
            <input
              type="number"
              step="0.01"
              required
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
            />
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70 hover:text-white py-1">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded accent-[#E8FF1F]"
            />
            <span>Active</span>
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
