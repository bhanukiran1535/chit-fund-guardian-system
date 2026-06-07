import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const inputClass = "w-full px-3.5 py-2.5 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors disabled:bg-gray-50 disabled:text-gray-400";

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-semibold text-gray-500">{label}</label>
    {children}
  </div>
);

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleSendOtp = async () => {
    if (!email) { setError('Please enter your email first'); return; }
    setIsVerifyingEmail(true); setError('');
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/send-otp`, { method: 'POST', body: { email }, showToast: false });
      setShowOtpInput(true);
      setSuccess('OTP sent to your email.');
    } catch (err) { setError(err.message); }
    finally { setIsVerifyingEmail(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp) { setError('Please enter the OTP'); return; }
    setIsVerifyingOtp(true); setError('');
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/verify-otp`, { method: 'POST', body: { email, otp }, showToast: false });
      setIsEmailVerified(true); setShowOtpInput(false); setSuccess('Email verified!');
    } catch (err) { setError(err.message); }
    finally { setIsVerifyingOtp(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setError('');
    if (!isEmailVerified) { setError('Please verify your email first'); setIsLoading(false); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setIsLoading(false); return; }
    try {
      const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/create`, {
        method: 'POST',
        body: { firstName, lastName, email, phoneNo, password },
        showToast: false
      });
      login({ id: data.user._id, email: data.user.email, isAdmin: data.user.isAdmin, token: data.token });
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div
      className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center px-4 py-8"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Back button */}
      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={15} />
          Back to Home
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.07)] px-8 py-8">
        {/* Logo + heading */}
        <div className="flex flex-col items-center mb-7">
          <div className="h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-sm">
            <span className="text-white font-bold text-[18px]">₹</span>
          </div>
          <h1 className="text-[20px] font-semibold text-gray-900">Create your account</h1>
          <p className="text-[13px] text-gray-400 mt-1 text-center">Join thousands managing chit funds securely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name">
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className={inputClass} required />
            </Field>
            <Field label="Last Name">
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className={inputClass} />
            </Field>
          </div>

          {/* Phone */}
          <Field label="Phone Number">
            <input type="tel" value={phoneNo} onChange={e => setPhoneNo(e.target.value)} placeholder="+91 98765 43210" className={inputClass} required />
          </Field>

          {/* Email + verification */}
          <Field label="Email Address">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (isEmailVerified) { setIsEmailVerified(false); setShowOtpInput(false); } }}
                placeholder="you@example.com"
                className={`${inputClass} flex-1`}
                required
                disabled={isEmailVerified}
              />
              {!isEmailVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isVerifyingEmail || !email}
                  className="shrink-0 px-3 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isVerifyingEmail ? '…' : 'Verify'}
                </button>
              )}
              {isEmailVerified && (
                <div className="shrink-0 flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                  <CheckCircle size={14} />
                  Verified
                </div>
              )}
            </div>

            <AnimatePresence>
              {showOtpInput && !isEmailVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 mt-2 overflow-hidden"
                >
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.slice(0, 6))}
                    placeholder="6-digit OTP"
                    className={`${inputClass} flex-1`}
                    maxLength="6"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || !otp}
                    className="shrink-0 px-3 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isVerifyingOtp ? '…' : 'Confirm'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </Field>

          {/* Password row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars" className={inputClass} required />
            </Field>
            <Field label="Confirm Password">
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat" className={inputClass} required />
            </Field>
          </div>

          {/* Messages */}
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
            disabled={isLoading || !isEmailVerified}
            className="w-full py-2.5 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-1"
          >
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[13px] text-gray-400 mt-6">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Sign in
          </button>
        </p>

        <p className="text-center text-[11px] text-gray-300 mt-4">
          By creating an account you agree to our{' '}
          <a href="/terms" className="underline">Terms</a> and{' '}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-gray-100">
          {['Bank-grade Security', 'OTP Verified', 'Data Encrypted'].map(label => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[11px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
