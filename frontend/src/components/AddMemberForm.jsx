import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, CheckCircle, UserPlus, Search } from 'lucide-react';
import debounce from 'lodash/debounce';
import { apiFetch } from '../lib/api';

const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-semibold text-gray-500">{label}</label>
    {children}
    {error && <p className="text-[12px] text-red-500">{error}</p>}
  </div>
);

const inputClass = "w-full px-3 py-2.5 text-[14px] sm:text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export const AddMemberForm = ({ onClose }) => {
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, setError, clearErrors, formState: { errors }, watch, reset } = useForm();
  const query = watch('query');

  useEffect(() => {
    const fetchGroups = async () => {
      const statuses = ['active', 'upcoming'];
      const results = await Promise.all(
        statuses.map(status =>
          apiFetch(`${import.meta.env.VITE_API_BASE_URL}/group/status/${status}`, { showToast: false })
        )
      );
      setGroupList(results.flatMap(r => (r.success ? r.groups : [])));
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!query?.trim()) { setUserResults([]); return; }
    const debouncedSearch = debounce(async () => {
      const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/search?query=${query}`, { showToast: false });
      if (data.success) setUserResults(data.users);
    }, 400);
    debouncedSearch();
    return () => { debouncedSearch.cancel(); };
  }, [query]);

  const onSubmit = async (data) => {
    if (!selectedUser) { setError('query', { type: 'manual', message: 'Please select a user from the results' }); return; }
    setIsLoading(true);
    setMessage('');
    clearErrors();
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/group/${data.groupId}/add-member`, {
        method: 'POST',
        body: { userId: selectedUser._id, amount: Number(data.amount) },
      });
      setMessage('success');
      setTimeout(() => { onClose(); reset(); }, 1400);
    } catch (err) {
      setMessage(err.message || 'Failed to add member.');
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
        className="bg-white w-full rounded-t-2xl sm:rounded-2xl border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.14)] sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-gray-900">Add Member to Group</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Search and assign a user to an existing group</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 sm:px-6 py-5 space-y-4">
          <Field label="Search User" error={errors.query?.message}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('query', { required: 'Search for a user' })}
                type="text"
                placeholder="Name, email, or alias…"
                className="w-full pl-9 pr-4 py-2.5 text-[14px] sm:text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {userResults.length > 0 && (
              <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden max-h-40 overflow-y-auto">
                {userResults.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => { setSelectedUser(user); clearErrors('query'); setUserResults([]); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-3 text-left hover:bg-gray-50 transition-colors text-[13px] ${selectedUser?._id === user._id ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-semibold shrink-0">
                      {user.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{user.firstName} {user.lastName} {user.alias ? `(${user.alias})` : ''}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query && query.trim() && userResults.length === 0 && !selectedUser && (
              <p className="text-[12px] text-gray-400 mt-1">No users found for "{query}"</p>
            )}
          </Field>

          {selectedUser && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-lg">
              <div className="h-7 w-7 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 text-[11px] font-semibold shrink-0">
                {selectedUser.firstName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-indigo-800 truncate">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-[11px] text-indigo-500 truncate">{selectedUser.email}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} className="text-indigo-400 hover:text-indigo-600 transition-colors p-1">
                <X size={13} />
              </button>
            </div>
          )}

          <Field label="Group" error={errors.groupId?.message}>
            <select
              {...register('groupId', { required: 'Select a group' })}
              className={inputClass}
            >
              <option value="">Select Group</option>
              {groupList.map((group) => (
                <option key={group._id} value={group._id}>
                  Group {group.groupNo} — ₹{group.chitValue.toLocaleString()}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Share Amount (₹)" error={errors.amount?.message}>
            <input
              {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be positive' }, valueAsNumber: true })}
              type="number"
              placeholder="e.g. 5000"
              className={inputClass}
            />
          </Field>

          {message === 'success' && (
            <p className="text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
              <CheckCircle size={13} />
              Member added successfully!
            </p>
          )}
          {message && message !== 'success' && (
            <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{message}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 sm:py-2.5 bg-indigo-600 text-white text-[14px] sm:text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 min-h-[44px]"
            >
              <UserPlus size={14} />
              {isLoading ? 'Adding…' : 'Add Member'}
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
