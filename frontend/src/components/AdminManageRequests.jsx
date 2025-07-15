import { useEffect, useState } from 'react';
import './AdminManageRequests.css';

export const AdminManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/all`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success) {
        const pending = data.requests.filter(req => req.status === 'pending' && req.type === 'join_group');
        setRequests(pending);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (userId, amount) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();
      alert(data.message || 'Approved');
      fetchRequests(); // Refresh after action
    } catch (error) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (userId, amount) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();
      alert(data.message || 'Rejected');
      fetchRequests();
    } catch (error) {
      alert('Failed to reject request');
    }
  };

  if (loading) return <p>Loading requests...</p>;
  if (requests.length === 0) return <p>No pending requests.</p>;

  return (
    <div className="request-list">
      <h2 className="section-title">Pending Join Requests</h2>
      {requests.map((req, index) => (
        <div className="request-card" key={index}>
          <p><strong>User:</strong> {req.user?.name || 'Unknown'}</p>
          <p><strong>Amount:</strong> ₹{req.amount.toLocaleString()}</p>
          <p><strong>Requested On:</strong> {new Date(req.createdAt).toLocaleString()}</p>

          <div className="action-buttons">
            <button
              className="action-btn approve"
              onClick={() => handleApprove(req.user._id, req.amount)}
            >
              Approve
            </button>
            <button
              className="action-btn reject"
              onClick={() => handleReject(req.user._id, req.amount)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
