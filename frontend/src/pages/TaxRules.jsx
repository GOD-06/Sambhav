import { useState, useEffect } from 'react';
import taxRuleService from '../services/taxRuleService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Receipt, Plus, Percent } from 'lucide-react';
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
      accessor: (t) => <span className="font-semibold text-gray-900">{t.name}</span>,
    },
    {
      header: 'Tax Rate (%)',
      accessor: (t) => <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">{t.rate}%</span>,
    },
    {
      header: 'Status',
      accessor: (t) => (
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${t.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {t.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Configured On',
      accessor: (t) => <span className="text-xs text-gray-400">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax Configuration"
        description="Administer regional VAT, Sales Tax, and GST calculation rules"
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

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={taxRules} emptyMessage="No tax rules configured." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Tax Rule">
        <form onSubmit={handleCreateTaxRule} className="space-y-4">
          <FormField label="Tax Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Standard VAT (20%)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <FormField label="Rate Percentage (%)" required help="Enter e.g. 20.00 for 20%">
            <input
              type="number"
              step="0.01"
              required
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              placeholder="20.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded text-blue-600"
            />
            <span>Active rule (applied during quotation and invoice calculation)</span>
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
              {submitting ? 'Saving...' : 'Save Tax Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
