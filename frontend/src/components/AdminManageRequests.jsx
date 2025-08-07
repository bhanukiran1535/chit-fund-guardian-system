import { useEffect, useState } from 'react';
import './AdminManageRequests.css';
import { apiFetch } from '../lib/api';

export const AdminManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/request/all`, { showToast: false });
      if (data.success) {
        const pending = data.requests.filter(req => req.status === 'pending' && req.type === 'join_group');
        setRequests(pending);
      }
    } catch (error) {
      // error toast handled by apiFetch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (userId, amount) => {
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/request/approve`, {
        method: 'POST',
        body: { userId, amount },
      });
      fetchRequests();
    } catch (error) {}
  };

  const handleReject = async (userId, amount) => {
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/request/reject`, {
        method: 'POST',
        body: { userId, amount },
      });
      fetchRequests();
    } catch (error) {}
  };

  if (loading) return <p>Loading requests...</p>;
  if (requests.length === 0) return <p>No pending requests.</p>;

  return (
    <div className="admin-manage-requests">
      <h3>Pending Join Requests</h3>
      <ul>
        {requests.map((req) => (
          <li key={req._id}>
            <span>{req.userId?.firstName} ({req.userId?.email}) - Amount: ₹{req.amount}</span>
            <button onClick={() => handleApprove(req.userId, req.amount)}>Approve</button>
            <button onClick={() => handleReject(req.userId, req.amount)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
