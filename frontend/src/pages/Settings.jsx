import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { User, Lock, Building, Phone, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    company_name: user?.company_name || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('accounts/profile/', profileForm);
      updateUser(res.data);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('accounts/change-password/', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      toast.success('Password changed successfully.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Password change failed.';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Account Settings"
        description="Manage your profile information and account security credentials"
      />

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> Personal Details
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First Name">
              <input
                type="text"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="Last Name">
              <input
                type="text"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email Address" help="Contact admin to modify login email">
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed"
              />
            </FormField>

            <FormField label="Role Privilege">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 rounded-lg border border-blue-100 text-blue-700 text-sm font-semibold capitalize">
                <ShieldCheck className="w-4 h-4" />
                {user?.role || 'Customer'}
              </div>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Company Name">
              <input
                type="text"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                placeholder="Acme Corp"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" /> Security & Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <FormField label="Current Password" required>
            <input
              type="password"
              required
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="New Password" required help="At least 8 characters">
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="Confirm New Password" required>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
