import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('auth/password-reset/confirm/', {
        token: `${uid}/${token}`,
        new_password: password,
      });
      setSuccess(true);
      toast.success('Password reset successfully.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.new_password?.[0] || 'Invalid or expired reset link.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#000000]">
      <div className="w-full max-w-sm rounded-2xl p-6 bg-[#0E0E10] border border-white/[0.08] shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#E8FF1F]/10 border border-[#E8FF1F]/20 text-[#E8FF1F] mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-white/50 mt-1">
            Choose a strong password with uppercase, lowercase, and special characters.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs text-emerald-400 font-medium">Password updated. Redirecting to login...</p>
            <Link
              to="/login"
              className="inline-block text-xs font-semibold text-[#E8FF1F] hover:underline"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-sm text-white focus:outline-none focus:border-[#E8FF1F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-sm text-white focus:outline-none focus:border-[#E8FF1F]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer shadow-sm"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-white/50 border-t border-white/[0.08] pt-4">
          <Link to="/login" className="text-[#E8FF1F] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

