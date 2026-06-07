import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, CheckCircle, Plus } from 'lucide-react';
import { apiFetch } from '../lib/api';

const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-semibold text-gray-500">{label}</label>
    {children}
    {error && <p className="text-[12px] text-red-500">{error}</p>}
  </div>
);

const inputClass = "w-full px-3 py-2.5 text-[14px] sm:text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export const CreateGroupForm = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, clearErrors, formState: { errors }, reset } = useForm();

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
      setMessage('success');
      setTimeout(() => { onClose(); reset(); }, 1400);
    } catch (err) {
      setMessage(err.message || 'Failed to create group.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div
        className="bg-white w-full rounded-t-2xl sm:rounded-2xl border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.14)] sm:max-w-md sm:mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-gray-900">Create New Group</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Set up a new chit fund group</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 sm:px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Chit Value (₹)" error={errors.chitValue?.message}>
              <input
                {...register('chitValue', { required: 'Chit value is required', min: { value: 1, message: 'Must be positive' }, valueAsNumber: true })}
                type="number"
                placeholder="e.g. 100000"
                className={inputClass}
              />
            </Field>
            <Field label="Tenure (months)" error={errors.tenure?.message}>
              <input
                {...register('tenure', { required: 'Tenure is required', min: { value: 1, message: 'At least 1 month' }, valueAsNumber: true })}
                type="number"
                placeholder="e.g. 20"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Start Month" error={errors.startMonth?.message}>
            <input
              {...register('startMonth', { required: 'Start month is required' })}
              type="month"
              className={inputClass}
            />
          </Field>

          <Field label="Foreman Commission (%)" error={errors.foremanCommission?.message}>
            <input
              {...register('foremanCommission', { required: 'Commission is required', min: { value: 0, message: 'Must be 0 or more' }, valueAsNumber: true })}
              type="number"
              placeholder="e.g. 5"
              step="0.1"
              className={inputClass}
            />
          </Field>

          {message === 'success' && (
            <p className="text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <CheckCircle size={13} />
              Group created successfully!
            </p>
          )}
          {message && message !== 'success' && (
            <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{message}</p>
          )}

          <div className="flex gap-2 pt-1 pb-safe">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 bg-indigo-600 text-white text-[14px] sm:text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 min-h-[44px]"
            >
              <Plus size={14} />
              {isLoading ? 'Creating…' : 'Create Group'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 sm:py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] sm:text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
