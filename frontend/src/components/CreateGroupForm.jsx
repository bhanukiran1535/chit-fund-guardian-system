import { useState } from 'react';
import './CreateGroupForm.css';

export const CreateGroupForm = ({ onClose }) => {
  const [groupData, setGroupData] = useState({
    chitValue: '',
    tenure: '',
    startMonth: '',
    foremanCommission: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setGroupData({ ...groupData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Creating group...');

     try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/group/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(groupData),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Group created successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to create group');
      }
    } catch (err) {
      setMessage('Something went wrong.');
    }
  };

  return (
    <div className="overlay">
      <div className="form-card">
        <h3>Create New Group</h3>
        <form onSubmit={handleSubmit} className="create-group-form">
          <input
            type="number"
            name="chitValue"
            placeholder="Chit Value"
            value={groupData.chitValue}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="tenure"
            placeholder="Tenure (Months)"
            value={groupData.tenure}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="startMonth"
            placeholder="Start Month"
            value={groupData.startMonth}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="foremanCommission"
            placeholder="Foreman Commission %"
            value={groupData.foremanCommission}
            onChange={handleChange}
            required
          />

          <button type="submit">Create Group</button>
          {message && <p className="form-message">{message}</p>}
        </form>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};
