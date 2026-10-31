import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Building, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [error, setError] = useState('');
  const { register, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const passwordRules = [
    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(formData.password) },
    { label: 'One special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
    { label: 'Passwords match', valid: formData.password && formData.password === formData.password_confirm },
  ];

  const isPasswordValid = passwordRules.every((rule) => rule.valid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Please meet all password requirements.');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
        phone: formData.phone,
        password: formData.password,
        password_confirm: formData.password_confirm,
      });

      toast.success('Registration complete. Please sign in.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        setError(`${firstKey}: ${Array.isArray(val) ? val.join(' ') : val}`);
      } else {
        setError('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (gEmail, gName) => {
    setError('');
    setGoogleLoading(true);
    try {
      const [first, ...last] = (gName || 'Google User').split(' ');
      const user = await googleAuth({
        email: gEmail || 'client.new@gmail.com',
        first_name: first || 'Google',
        last_name: last.join(' ') || 'Customer',
      });
      toast.success('Google sign-up successful');
      setShowGoogleModal(false);
      navigate('/packages');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Google sign-up failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 py-8">
      <div className="max-w-lg w-full bg-[#0E0E10] rounded-2xl border border-white/[0.1] p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-[#E8FF1F] text-black rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-sm font-mono tracking-tight shadow-sm">
            SM
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Subscription Management System</h1>
          <p className="text-xs text-white/50 mt-1">Create your client subscription account</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-Up Action */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={googleLoading}
          className="w-full py-2.5 px-4 mb-4 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.15] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2.5 transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#0E0E10] px-2 text-[10px] text-white/40 uppercase tracking-wider font-mono">
            or register with email
          </span>
          <div className="border-t border-white/[0.08] w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">First Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  name="first_name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-xs text-white outline-none focus:border-[#E8FF1F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Last Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  name="last_name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-xs text-white outline-none focus:border-[#E8FF1F]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Company Name (Optional)</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-xs text-white outline-none focus:border-[#E8FF1F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Phone (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-xs text-white outline-none focus:border-[#E8FF1F]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                name="password_confirm"
                required
                value={formData.password_confirm}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] p-3 rounded-xl space-y-1.5">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">Password Rules:</span>
            {passwordRules.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${r.valid ? 'text-emerald-400' : 'text-white/20'}`}
                />
                <span className={r.valid ? 'text-emerald-400 font-mono' : 'text-white/40'}>{r.label}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg transition text-xs disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/50 border-t border-white/[0.08] pt-4">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#E8FF1F] hover:underline">
            Sign In
          </Link>
        </div>
      </div>

      {/* Google Sign-Up Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full bg-[#111114] border border-white/[0.15] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.08]">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Google Sign Up</h3>
                <p className="text-[11px] text-white/50">Register with Google account</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => handleGoogleSignUp('new.customer@gmail.com', 'Jordan Taylor')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-white">Jordan Taylor</p>
                  <p className="text-[11px] text-white/50 font-mono">new.customer@gmail.com</p>
                </div>
                <span className="text-[10px] text-[#E8FF1F] font-mono">Register</span>
              </button>
            </div>

            <div className="border-t border-white/[0.08] pt-3 space-y-2">
              <p className="text-[11px] text-white/60">Or use your custom Google account:</p>
              <input
                type="text"
                placeholder="Full Name"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full px-3 py-1.5 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none"
              />
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none"
              />
              <button
                type="button"
                disabled={!googleEmail}
                onClick={() => handleGoogleSignUp(googleEmail, googleName || 'Google Customer')}
                className="w-full py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs transition cursor-pointer disabled:opacity-40"
              >
                Complete Google Registration
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.08] text-right">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-xs text-white/50 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
