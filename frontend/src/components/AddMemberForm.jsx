import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import './CreateGroupForm.css'; // Reuse same styles
import debounce from 'lodash/debounce';
import { apiFetch } from '../lib/api';

export const AddMemberForm = ({ onClose }) => {
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    watch,
    reset
  } = useForm();
  const query = watch('query');
  const groupId = watch('groupId');
  const amount = watch('amount');

  useEffect(() => {
    const fetchGroups = async () => {
      const statuses = ['active', 'upcoming'];
      const results = await Promise.all(
        statuses.map(status =>
          apiFetch(`${import.meta.env.VITE_API_BASE_URL}/group/status/${status}`, { showToast: false })
        )
      );
      const mergedGroups = results.flatMap(r => (r.success ? r.groups : []));
      setGroupList(mergedGroups);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!query?.trim()) {
      setUserResults([]);
      return;
    }
    const debouncedSearch = debounce(async () => {
      const data = await apiFetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/search?query=${query}`,
        { showToast: false }
      );
      if (data.success) {
        setUserResults(data.users);
      }
    }, 400);
    debouncedSearch();
    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  const onSubmit = async (data) => {
    if (!selectedUser) {
      setError('query', { type: 'manual', message: 'Please select a user' });
      return;
    }
    setIsLoading(true);
    setMessage('');
    clearErrors();
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/group/${data.groupId}/add-member`, {
        method: 'POST',
        body: {
          userId: selectedUser._id,
          amount: Number(data.amount),
        },
      });
      setMessage('Member added successfully!');
      setTimeout(() => {
        onClose();
        reset();
      }, 1500);
    } catch (err) {
      setMessage(err.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="form-card">
        <h3>Add Member to Group</h3>
        <form className="create-group-form" onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('query', { required: 'Search for a user' })}
            type="text"
            placeholder="Search user by name/email/alias"
            aria-invalid={!!errors.query}
          />
          {errors.query && <span className="error">{errors.query.message}</span>}
          {userResults.length > 0 && (
            <ul className="user-results">
              {userResults.map((user) => (
                <li
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    clearErrors('query');
                  }}
                  className={selectedUser?._id === user._id ? 'selected' : ''}
                >
                  {user.firstName} {user.alias ? `(${user.alias})` : ''} - {user.email}
                </li>
              ))}
            </ul>
          )}
          {query && userResults.length === 0 && (
            <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
              No users found matching "{query}"
            </div>
          )}
          {selectedUser && (
            <div className="selected-user">
              Selected: {selectedUser.firstName} ({selectedUser.alias})
            </div>
          )}
          <select {...register('groupId', { required: 'Select a group' })} aria-invalid={!!errors.groupId}>
            <option value="">Select Group</option>
            {groupList.map((group) => (
              <option key={group._id} value={group._id}>
                {group.groupNo} - {group.chitValue}
              </option>
            ))}
          </select>
          {errors.groupId && <span className="error">{errors.groupId.message}</span>}
          <input
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 1, message: 'Amount must be positive' },
              valueAsNumber: true,
            })}
            type="number"
            placeholder="Share Amount"
            aria-invalid={!!errors.amount}
          />
          {errors.amount && <span className="error">{errors.amount.message}</span>}
          {message && <span className={message.includes('success') ? 'success' : 'error'}>{message}</span>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Member'}
          </button>
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
