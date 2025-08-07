import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import './ChangePasswordModal.css';
import { apiFetch } from '../lib/api';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleClose = () => {
    onClose();
    reset();
    setSuccess('');
    clearErrors();
  };

  const onSubmit = async (data) => {
    if (newPassword !== confirmPassword) {
      setError('confirmPassword', { type: 'manual', message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    clearErrors();
    setSuccess('');
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/change-password`, {
        method: 'POST',
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
      });

      setSuccess('Password changed successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('root', { type: 'manual', message: err.message || 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <button className="close-btn" onClick={handleClose} aria-label="Close"><X /></button>
        <h2>Change Password</h2>
        <form className="change-password-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <input
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
            placeholder="Current Password"
            aria-invalid={!!errors.currentPassword}
          />
          {errors.currentPassword && <span className="error">{errors.currentPassword.message}</span>}

          <input
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Minimum 6 characters required' },
            })}
            placeholder="New Password"
            aria-invalid={!!errors.newPassword}
          />
          {errors.newPassword && <span className="error">{errors.newPassword.message}</span>}

          <input
            type="password"
            {...register('confirmPassword', { required: 'Confirm your new password' })}
            placeholder="Confirm New Password"
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}

          {errors.root && <span className="error">{errors.root.message}</span>}
          {success && <span className="success">{success}</span>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
