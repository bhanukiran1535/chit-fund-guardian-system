import { useState, useEffect } from 'react';
import './CreateGroupForm.css'; // Reuse same styles
import debounce from 'lodash/debounce'; // live search function // npm install lodash

export const AddMemberForm = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupList, setGroupList] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      const statuses = ['active', 'upcoming'];
      const results = await Promise.all(
        statuses.map(status =>
          fetch(`${import.meta.env.VITE_API_BASE_URL}/group/status/${status}`, {
            credentials: 'include',
          }).then(res => res.json())
        )
      );
      const mergedGroups = results.flatMap(r => (r.success ? r.groups : []));
      setGroupList(mergedGroups);
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }

    const debouncedSearch = debounce(async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/user/search?query=${query}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.success) {
        setUserResults(data.users);
      }
    }, 400); // 400ms debounce

    debouncedSearch();

    return () => {
      debouncedSearch.cancel(); // Important cleanup to avoid stale calls
    };
  }, [query]);

  const handleAddMember = async () => {
    if (!selectedUser || !groupId || !amount) {
      return alert("Please fill all fields");
    }
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/group/${groupId}/add-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userId: selectedUser._id,
        amount: Number(amount),
      }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (data.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="overlay">
      <div className="form-card">
        <h3>Add Member to Group</h3>

        <div className="create-group-form">
          <input
            type="text"
            placeholder="Search user by name/email/alias"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {userResults.length > 0 && (
            <ul className="user-results">
              {userResults.map((user) => (
                <li key={user._id} onClick={() => setSelectedUser(user)}>
                  {user.firstName} {user.alias ? `(${user.alias})` : ""} -{" "}
                  {user.email}
                </li>
              ))}
            </ul>
          )}

          {query && userResults.length === 0 && (
            <div style={{ color: "#6b7280", marginBottom: "1rem" }}>
              No users found matching "{query}"
            </div>
          )}

          {selectedUser && (
            <div className="selected-user">
              Selected: {selectedUser.firstName} ({selectedUser.alias})
            </div>
          )}

          <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            <option value="">-- Select Group --</option>
            {groupList.map((group) => (
              <option key={group._id} value={group._id}>
                {group.groupNo} - ₹{group.chitValue}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button onClick={handleAddMember}>Add Member</button>
          {message && <p className="form-message">{message}</p>}
        </div>

        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};
