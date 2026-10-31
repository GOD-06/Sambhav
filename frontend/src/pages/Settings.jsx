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
    <div className="space-y-5 max-w-3xl">
      <PageHeader
        title="Settings"
        description="Profile details and password credentials"
      />

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Profile</h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="First Name">
              <input
                type="text"
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>

            <FormField label="Last Name">
              <input
                type="text"
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Email">
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-white/[0.08] bg-white/[0.02] rounded-lg text-xs text-white/40 cursor-not-allowed font-mono"
              />
            </FormField>

            <FormField label="Role">
              <input
                type="text"
                disabled
                value={user?.role || 'Customer'}
                className="w-full px-3 py-2 border border-white/[0.08] bg-white/[0.02] rounded-lg text-xs text-white/40 capitalize cursor-not-allowed font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Company">
              <input
                type="text"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F] font-mono"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/[0.08]">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-3.5 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security</h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <FormField label="Current Password" required>
            <input
              type="password"
              required
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="New Password" required help="Minimum 8 characters">
              <input
                type="password"
                required
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>

            <FormField label="Confirm Password" required>
              <input
                type="password"
                required
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/[0.08]">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-3.5 py-1.5 bg-white/[0.1] hover:bg-white/[0.15] text-white border border-white/[0.15] font-semibold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer"
            >
              {savingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
