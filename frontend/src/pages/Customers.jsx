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

  const handleOpenSubscribe = (customer) => {
    setSubscribingCustomer(customer);
    setSubscribeModalOpen(true);
  };

  const handleAssignSubscription = async (e) => {
    e.preventDefault();
    if (!subscribingCustomer || !selectedPlanId) return;
    setSubscribing(true);
    try {
      await api.post('subscriptions/subscribe/', {
        customer_id: subscribingCustomer.id,
        plan_id: selectedPlanId,
        payment_method: 'credit_card',
        note: `Admin subscription assignment for ${subscribingCustomer.email}`,
      });
      toast.success(`Subscribed ${subscribingCustomer.first_name || subscribingCustomer.email} successfully.`);
      setSubscribeModalOpen(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Subscription assignment failed.';
      toast.error(msg);
    } finally {
      setSubscribing(false);
    }
  };

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
        <span className="font-medium text-white">
          {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.email}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: (c) => <span className="text-white/70 font-mono">{c.email}</span>,
    },
    {
      header: 'Company',
      accessor: (c) => <span className="text-white/70">{c.company_name || 'Individual'}</span>,
    },
    {
      header: 'Phone',
      accessor: (c) => <span className="text-white/50 font-mono">{c.phone || 'N/A'}</span>,
    },
    {
      header: 'Date Joined',
      accessor: (c) => (
        <span className="text-white/50 font-mono">
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

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-9 pr-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
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
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
            <FormField label="Last Name">
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
          </div>

          <FormField label="Email" required>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Company">
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
          </div>

          <FormField label="Password" required help="Minimum 8 characters">
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

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
              disabled={creating}
              className="px-3.5 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
            >
              {creating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
