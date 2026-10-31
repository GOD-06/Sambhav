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
      accessor: (t) => <span className="font-semibold text-slate-900">{t.name}</span>,
    },
    {
      header: 'Rate (%)',
      accessor: (t) => (
        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-200">
          {t.rate}%
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (t) => (
        <span className={`px-2 py-0.5 text-xs rounded font-medium border ${t.is_active ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {t.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created Date',
      accessor: (t) => <span className="text-xs text-slate-500">{t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A'}</span>,
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

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
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
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <FormField label="Rate (%)" required help="e.g. 20.00 for 20%">
            <input
              type="number"
              step="0.01"
              required
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            <span>Active</span>
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
