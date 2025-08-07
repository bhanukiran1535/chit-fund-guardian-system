import { useState } from 'react';
import { useForm } from 'react-hook-form';
import './CreateGroupForm.css';
import { apiFetch } from '../lib/api';

export const CreateGroupForm = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage('');
    clearErrors();
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/group/create`, {
        method: 'POST',
        body: {
          chitValue: Number(data.chitValue),
          tenure: Number(data.tenure),
          startMonth: data.startMonth,
          foremanCommission: Number(data.foremanCommission),
        },
      });
      setMessage('Group created successfully!');
      setTimeout(() => {
        onClose();
        reset();
      }, 1500);
    } catch (err) {
      setMessage(err.message || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="form-card">
        <h3>Create New Group</h3>
        <form className="create-group-form" onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('chitValue', {
              required: 'Chit value is required',
              min: { value: 1, message: 'Chit value must be positive' },
              valueAsNumber: true,
            })}
            placeholder="Chit Value (e.g., 100000)"
            type="number"
            aria-invalid={!!errors.chitValue}
          />
          {errors.chitValue && <span className="error">{errors.chitValue.message}</span>}
          <input
            {...register('tenure', {
              required: 'Tenure is required',
              min: { value: 1, message: 'Tenure must be at least 1' },
              valueAsNumber: true,
            })}
            placeholder="Tenure (months)"
            type="number"
            aria-invalid={!!errors.tenure}
          />
          {errors.tenure && <span className="error">{errors.tenure.message}</span>}
          <input
            {...register('startMonth', {
              required: 'Start month is required',
            })}
            placeholder="Start Month (YYYY-MM)"
            type="month"
            aria-invalid={!!errors.startMonth}
          />
          {errors.startMonth && <span className="error">{errors.startMonth.message}</span>}
          <input
            {...register('foremanCommission', {
              required: 'Foreman commission is required',
              min: { value: 0, message: 'Commission must be 0 or more' },
              valueAsNumber: true,
            })}
            placeholder="Foreman Commission (%)"
            type="number"
            aria-invalid={!!errors.foremanCommission}
          />
          {errors.foremanCommission && <span className="error">{errors.foremanCommission.message}</span>}
          {message && <span className={message.includes('success') ? 'success' : 'error'}>{message}</span>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
