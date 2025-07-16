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
          <div className="input-group">
            <label htmlFor="chitValue">Chit Value (₹)</label>
            <input
              id="chitValue"
              type="number"
              name="chitValue"
              placeholder="Enter total chit value"
              value={groupData.chitValue}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="tenure">Tenure (Months)</label>
            <input
              id="tenure"
              type="number"
              name="tenure"
              placeholder="Number of months"
              value={groupData.tenure}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="startMonth">Start Month</label>
            <input
              id="startMonth"
              type="text"
              name="startMonth"
              placeholder="e.g., January 2024"
              value={groupData.startMonth}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="foremanCommission">Foreman Commission (%)</label>
            <input
              id="foremanCommission"
              type="number"
              name="foremanCommission"
              placeholder="Commission percentage"
              value={groupData.foremanCommission}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">Create Group</button>
          {message && <p className="form-message">{message}</p>}
        </form>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};
