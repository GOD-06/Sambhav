import { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    password: '',
  });

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data.results || data);
    } catch (err) {
      toast.error('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await customerService.create(formData);
      toast.success('Customer created.');
      setIsModalOpen(false);
      setFormData({ email: '', first_name: '', last_name: '', company_name: '', phone: '', password: '' });
      loadCustomers();
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || 'Error creating customer.';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.email?.toLowerCase().includes(q) ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      header: 'Name',
      accessor: (c) => (
        <span className="font-medium text-slate-900">
          {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.email}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: (c) => <span className="text-slate-600">{c.email}</span>,
    },
    {
      header: 'Company',
      accessor: (c) => <span className="text-slate-600">{c.company_name || 'Individual'}</span>,
    },
    {
      header: 'Phone',
      accessor: (c) => <span className="text-slate-500">{c.phone || 'N/A'}</span>,
    },
    {
      header: 'Date Joined',
      accessor: (c) => (
        <span className="text-slate-500">
          {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        description="Customer accounts and contact details"
        action={{
          label: 'Add Customer',
          icon: Plus,
          onClick: () => setIsModalOpen(true),
        }}
      />

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="relative mb-3 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
          />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredCustomers} emptyMessage="No customers found." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Customer">
        <form onSubmit={handleCreateCustomer} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" required>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
            <FormField label="Last Name">
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <FormField label="Email" required>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Company">
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <FormField label="Password" required help="Minimum 8 characters">
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

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
              disabled={creating}
              className="px-3 py-1.5 bg-blue-700 text-white rounded text-xs font-medium hover:bg-blue-800 disabled:opacity-50"
            >
              {creating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
