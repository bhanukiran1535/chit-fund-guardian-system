import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, CheckCircle, Mail, Key } from 'lucide-react';
import { apiFetch } from '../lib/api';

const inputClass = "w-full px-3.5 py-2.5 text-[14px] sm:text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors";

const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-semibold text-gray-500">{label}</label>
    {children}
    {error && <p className="text-[12px] text-red-500">{error}</p>}
  </div>
);

const STEPS = ['Email', 'Reset', 'Done'];

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, setError, clearErrors, formState: { errors }, watch, reset } = useForm();

  const handleSendOtp = async (data) => {
    setIsLoading(true); setSuccess(''); clearErrors();
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/request-password-reset`, {
        method: 'POST',
        body: { email: data.email },
      });
      setStep(2);
      setSuccess('OTP sent — check your inbox.');
    } catch (err) {
      setError('email', { type: 'manual', message: err.message });
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true); setSuccess(''); clearErrors();
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/reset-password`, {
        method: 'POST',
        body: { email: data.email, otp: data.otp, newPassword: data.newPassword },
      });
      setStep(3);
      setSuccess('Password reset successfully!');
      setTimeout(() => { handleClose(); }, 2200);
    } catch (err) {
      setError('otp', { type: 'manual', message: err.message });
    } finally { setIsLoading(false); }
  };

  const handleClose = () => {
    onClose(); reset(); setStep(1); setSuccess(''); clearErrors();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={handleClose}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div
        className="bg-white w-full rounded-t-2xl sm:rounded-2xl border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.14)] sm:max-w-sm sm:mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Reset Password</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? 'Enter the OTP and your new password' : 'All done!'}
            </p>
          </div>
          <button onClick={handleClose} className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center px-5 sm:px-6 pt-4 pb-1 gap-1.5">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-[11px] font-semibold ${step === i + 1 ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-emerald-400' : 'bg-gray-100'}`} />}
            </div>
          ))}
        </div>

        <div className="px-5 sm:px-6 py-5">
          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-4">
              <Field label="Email Address" error={errors.email?.message}>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /.+@.+\..+/, message: 'Invalid email' } })}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 text-[14px] sm:text-[13px] border border-gray-200 rounded-lg bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
                  />
                </div>
              </Field>
              {success && <p className="text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{success}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-2.5 bg-indigo-600 text-white text-[14px] sm:text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 min-h-[44px]"
              >
                {isLoading ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP + new password */}
          {step === 2 && (
            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
              {success && <p className="text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-1.5"><CheckCircle size={12} />{success}</p>}
              <Field label="OTP Code" error={errors.otp?.message}>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'OTP must be 6 digits' }, maxLength: { value: 6, message: 'OTP must be 6 digits' } })}
                    placeholder="6-digit code"
                    className="w-full pl-9 pr-4 py-2.5 text-[14px] sm:text-[13px] border border-gray-200 rounded-lg bg-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors tracking-widest"
                    maxLength={6}
                  />
                </div>
              </Field>
              <Field label="New Password" error={errors.newPassword?.message}>
                <input
                  {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                />
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword?.message}>
                <input
                  {...register('confirmPassword', { required: 'Confirm your password' })}
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                />
              </Field>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex-1 py-3 sm:py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] sm:text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 sm:py-2.5 bg-indigo-600 text-white text-[14px] sm:text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 min-h-[44px]"
                >
                  {isLoading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <h3 className="text-[15px] font-semibold text-gray-900">Password Reset!</h3>
              <p className="text-[13px] text-gray-400 text-center">You can now sign in with your new password.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
