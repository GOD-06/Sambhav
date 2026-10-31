import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserCog, Plus, Mail, ShieldCheck, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get('users/');
      const allUsers = res.data.results || res.data;
      setStaffList(allUsers.filter((u) => u.role === 'staff' || u.role === 'admin'));
    } catch (err) {
      toast.error('Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('auth/staff/create/', form);
      toast.success('Staff team member registered successfully.');
      setIsModalOpen(false);
      setForm({ first_name: '', last_name: '', email: '', password: '' });
      loadStaff();
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || 'Error registering staff member.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Staff Member',
      accessor: (s) => (
        <div>
          <div className="font-semibold text-gray-900">{s.first_name ? `${s.first_name} ${s.last_name || ''}` : s.email}</div>
          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" /> {s.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Role Privilege',
      accessor: (s) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${s.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          {s.role === 'admin' ? 'Administrator' : 'Internal Staff'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (s) => (
        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
          Active
        </span>
      ),
    },
    {
      header: 'Created On',
      accessor: (s) => (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'System'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Access Control"
        description="Exclusive Admin module: Provision daily operation staff accounts and permissions"
        action={{
          label: 'Add Staff Member',
          icon: Plus,
          onClick: () => setIsModalOpen(true),
        }}
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={staffList} emptyMessage="No staff members registered." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" required>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="Last Name">
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <FormField label="Work Email Address" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="staff@brightloop.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <FormField label="Temporary Password" required help="Staff will use this to sign in">
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Register Staff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
