import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { useAuth } from '../context/AuthContext';

const inputClass = "w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/login`, {
        method: 'POST',
        body: { email, password },
        showToast: false
      });
      login({
        ...data.user,
        id: data.user.id || data.user._id,
        token: data.token,
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center px-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Back button */}
      <div className="w-full max-w-sm mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={15} />
          Back to Home
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.07)] px-8 py-8">
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-7">
          <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white font-bold text-[18px]">₹</span>
          </div>
          <h1 className="text-[20px] font-semibold text-gray-900">Sign in to Chitfunds</h1>
          <p className="text-[13px] text-gray-400 mt-1 text-center">Manage your chit groups securely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[12px] font-semibold text-gray-500">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-[12px] font-semibold text-gray-500">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 px-3 py-2.5 rounded-lg">
              <AlertCircle size={13} className="shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-lg">
              <CheckCircle size={13} className="shrink-0" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-1"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[13px] text-gray-400 mt-6">
          No account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Create one
          </button>
        </p>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-gray-100">
          {['Data Encrypted','Bank-grade Security'].map(label => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <ForgotPasswordModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)} />
    </div>
  );
};

export default Login;
