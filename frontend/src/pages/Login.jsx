import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Signed in successfully');
      if (user.role === 'customer') {
        navigate('/my-subscriptions');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Invalid email or password.';
      setError(detail);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (gEmail, gName) => {
    setError('');
    setGoogleLoading(true);
    try {
      const [first, ...last] = (gName || 'Google User').split(' ');
      const user = await googleAuth({
        email: gEmail || 'client.subscriber@gmail.com',
        first_name: first || 'Google',
        last_name: last.join(' ') || 'User',
      });
      toast.success('Google authentication successful');
      setShowGoogleModal(false);
      if (user.role === 'customer') {
        navigate('/packages');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Google sign-in failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await api.post('auth/password-reset/', { email: forgotEmail });
      setForgotSubmitted(true);
      toast.success('Password reset link sent to registered email.');
    } catch (err) {
      toast.error('Unable to process password reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0E0E10] rounded-2xl border border-white/[0.1] p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 bg-[#E8FF1F] text-black rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-sm font-mono tracking-tight shadow-sm">
            SM
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Subscription Management System</h1>
          <p className="text-xs text-white/50 mt-1">Sign in to your client account</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Action */}
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
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/[0.08] w-full" />
          <span className="bg-[#0E0E10] px-2 text-[10px] text-white/40 uppercase tracking-wider font-mono">
            or sign in with email
          </span>
          <div className="border-t border-white/[0.08] w-full" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-sm text-white focus:outline-none focus:border-[#E8FF1F]"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-white/70">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-[#E8FF1F] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/[0.12] bg-white/[0.05] text-sm text-white focus:outline-none focus:border-[#E8FF1F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg transition text-xs disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/50 border-t border-white/[0.08] pt-4">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-[#E8FF1F] hover:underline">
            Register
          </Link>
        </div>
      </div>

      {/* Google Sign-In Selector Modal */}
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
                <h3 className="text-sm font-semibold text-white">Google Accounts</h3>
                <p className="text-[11px] text-white/50">Select account to sign in</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <button
                type="button"
                onClick={() => handleGoogleSignIn('client.subscriber@gmail.com', 'Alex Client')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-white">Alex Client</p>
                  <p className="text-[11px] text-white/50 font-mono">client.subscriber@gmail.com</p>
                </div>
                <span className="text-[10px] text-[#E8FF1F] font-mono">Select</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSignIn('sarah.business@gmail.com', 'Sarah Business')}
                className="w-full text-left p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-white">Sarah Business</p>
                  <p className="text-[11px] text-white/50 font-mono">sarah.business@gmail.com</p>
                </div>
                <span className="text-[10px] text-[#E8FF1F] font-mono">Select</span>
              </button>
            </div>

            <div className="border-t border-white/[0.08] pt-3 space-y-2">
              <p className="text-[11px] text-white/60">Or sign in with custom Google email:</p>
              <input
                type="text"
                placeholder="Full Name"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full px-3 py-1.5 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none"
              />
              <input
                type="email"
                placeholder="username@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full px-3 py-1.5 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none"
              />
              <button
                type="button"
                disabled={!googleEmail}
                onClick={() => handleGoogleSignIn(googleEmail, googleName || 'Google User')}
                className="w-full py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs transition cursor-pointer disabled:opacity-40"
              >
                Authenticate Google Account
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full bg-[#111114] border border-white/[0.15] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.08]">
              <div className="w-8 h-8 rounded-lg bg-[#E8FF1F]/10 border border-[#E8FF1F]/20 text-[#E8FF1F] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Reset Password</h3>
                <p className="text-[11px] text-white/50">Receive a reset link at your registered email</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-white/70">
                  If an account exists for <span className="font-mono text-white font-medium">{forgotEmail}</span>, a password reset link has been dispatched.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                    setForgotEmail('');
                  }}
                  className="w-full py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="account@company.com"
                    className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
