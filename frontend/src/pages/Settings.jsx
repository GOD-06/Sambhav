import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
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
      toast.success('Profile updated.');
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
      toast.success('Password updated.');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Password update failed.';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Settings"
        description="Profile details and password credentials"
      />

      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Profile</h3>

        <form onSubmit={handleUpdateProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="First Name">
              <input
                type="text"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="Last Name">
              <input
                type="text"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Email">
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded text-xs text-slate-500 cursor-not-allowed"
              />
            </FormField>

            <FormField label="Role">
              <input
                type="text"
                disabled
                value={user?.role || 'Customer'}
                className="w-full px-2.5 py-1.5 border border-slate-200 bg-slate-50 rounded text-xs text-slate-500 capitalize cursor-not-allowed"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Company">
              <input
                type="text"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-3 py-1.5 bg-blue-700 text-white rounded text-xs font-medium hover:bg-blue-800 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Security</h3>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <FormField label="Current Password" required>
            <input
              type="password"
              required
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="New Password" required help="Minimum 8 characters">
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="Confirm Password" required>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-black disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
