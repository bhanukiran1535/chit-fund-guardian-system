import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import './ForgotPasswordModal.css';
import { apiFetch } from '../lib/api';

export const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    watch,
    reset
  } = useForm();
  const email = watch('email');
  const otp = watch('otp');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const handleSendOtp = async (data) => {
    setIsLoading(true);
    setSuccess('');
    clearErrors();
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/request-password-reset`, {
        method: 'POST',
        body: { email: data.email },
      });
      setStep(2);
      setSuccess('OTP sent to your email. Check your inbox.');
    } catch (err) {
      setError('email', { type: 'manual', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    setSuccess('');
    clearErrors();
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/reset-password`, {
        method: 'POST',
        body: {
          email: data.email,
          otp: data.otp,
          newPassword: data.newPassword,
        },
      });
      setStep(3);
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        onClose();
        reset();
        setStep(1);
      }, 2000);
    } catch (err) {
      setError('otp', { type: 'manual', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setStep(1);
    setSuccess('');
    clearErrors();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Forgot Password</h2>
          <button className="close-button" onClick={handleClose}><X /></button>
        </div>
        {step === 1 && (
          <form className="forgot-password-form" onSubmit={handleSubmit(handleSendOtp)}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /.+@.+\..+/, message: 'Invalid email address' },
                })}
                placeholder="Enter your email"
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className="error-message">{errors.email.message}</span>}
              {success && <span className="success-message">{success}</span>}
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}
        {step === 2 && (
          <form className="forgot-password-form" onSubmit={handleSubmit(handleResetPassword)}>
            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                className="form-input"
                {...register('otp', { required: 'OTP is required', minLength: { value: 6, message: 'OTP must be 6 digits' }, maxLength: { value: 6, message: 'OTP must be 6 digits' } })}
                placeholder="Enter OTP"
                aria-invalid={!!errors.otp}
              />
              {errors.otp && <span className="error-message">{errors.otp.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                {...register('newPassword', { required: 'New password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                placeholder="New Password"
                aria-invalid={!!errors.newPassword}
              />
              {errors.newPassword && <span className="error-message">{errors.newPassword.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                {...register('confirmPassword', { required: 'Confirm your password' })}
                placeholder="Confirm Password"
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
            </div>
            {success && <span className="success-message">{success}</span>}
            <div className="button-group">
              <button type="button" className="back-button" onClick={() => setStep(1)} disabled={isLoading}>Back</button>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        {step === 3 && (
          <div className="success-screen">
            <div className="success-icon">✓</div>
            <h3>Password reset successfully!</h3>
            <p>You can now log in with your new password.</p>
          </div>
        )}
      </div>
    </div>
  );
};