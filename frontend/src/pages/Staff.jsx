import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus } from 'lucide-react';
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
      toast.error('Failed to load staff.');
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
      toast.success('Staff member registered.');
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
        <span className="font-semibold text-white">
          {s.first_name ? `${s.first_name} ${s.last_name || ''}` : s.email}
        </span>
      ),
    },
    {
      header: 'Email',
      accessor: (s) => <span className="text-white/70 font-mono">{s.email}</span>,
    },
    {
      header: 'Role',
      accessor: (s) => (
        <span className={`px-2 py-0.5 text-xs rounded-md font-mono font-medium capitalize border ${s.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-sky-500/10 text-sky-400 border-sky-500/30'}`}>
          {s.role}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: () => (
        <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
          Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff Accounts"
        description="Internal personnel access and roles"
        action={{
          label: 'Add Staff',
          icon: Plus,
          onClick: () => setIsModalOpen(true),
        }}
      />

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={staffList} emptyMessage="No staff members registered." />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Staff Member">
        <form onSubmit={handleCreateStaff} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" required>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>

            <FormField label="Last Name">
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
          </div>

          <FormField label="Email" required>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <FormField label="Temporary Password" required>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
