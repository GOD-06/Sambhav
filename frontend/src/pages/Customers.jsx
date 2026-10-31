import { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, Plus, Search, Building, Mail, Phone, Calendar } from 'lucide-react';
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
      toast.success('Customer created successfully.');
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
      header: 'Customer',
      accessor: (c) => (
        <div>
          <div className="font-medium text-gray-900">{c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.email}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" /> {c.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Company',
      accessor: (c) => (
        <span className="text-gray-700 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-gray-400" />
          {c.company_name || 'Individual'}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: (c) => (
        <span className="text-gray-600 text-xs">
          {c.phone || '—'}
        </span>
      ),
    },
    {
      header: 'Joined Date',
      accessor: (c) => (
        <span className="text-gray-500 text-xs flex items-center gap-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        description="Manage accounts, contact details, and customer billing profiles"
        action={{
          label: 'Add Customer',
          icon: Plus,
          onClick: () => setIsModalOpen(true),
        }}
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {/* Search Input */}
        <div className="relative mb-4 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, company..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={filteredCustomers} emptyMessage="No customers found." />
        )}
      </div>

      {/* Create Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Customer">
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" required>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
            <FormField label="Last Name">
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <FormField label="Email" required>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Company Name">
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <FormField label="Initial Password" required help="Minimum 8 characters">
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

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
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? 'Saving...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
