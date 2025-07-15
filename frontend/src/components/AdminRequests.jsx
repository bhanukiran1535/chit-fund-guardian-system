<<<<<<< HEAD:src/components/AdminRequests.jsx

=======
import { useEffect, useState } from 'react';
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/AdminRequests.jsx
import { CheckCircle, XCircle, Clock, Users, DollarSign, Calendar } from 'lucide-react';
import './AdminRequests.css';

export const AdminRequests = () => {
<<<<<<< HEAD:src/components/AdminRequests.jsx
  // Mock pending requests data
  const requests = [
    {
      id: '1',
      type: 'join_group',
      user: 'John Doe',
      email: 'john@example.com',
      groupNo: 'G001',
      amount: null,
      message: 'Would like to join the January 2024 group',
      timestamp: '2024-03-12T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      type: 'payment_confirmation',
      user: 'Jane Smith',
      email: 'jane@example.com',
      groupNo: 'G002',
      amount: 5000,
      message: 'Cash payment made for March 2024',
      timestamp: '2024-03-12T14:20:00Z',
      status: 'pending'
    },
    {
      id: '3',
      type: 'payout_booking',
      user: 'Mike Johnson',
      email: 'mike@example.com',
      groupNo: 'G001',
      amount: null,
      message: 'Request to pre-book Month 8 payout',
      timestamp: '2024-03-11T16:45:00Z',
      status: 'pending'
    },
    {
      id: '4',
      type: 'leave_group',
      user: 'Sarah Wilson',
      email: 'sarah@example.com',
      groupNo: 'G003',
      amount: null,
      message: 'Family emergency - need to leave group',
      timestamp: '2024-03-10T09:15:00Z',
      status: 'pending'
    }
  ];

=======
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
// State to hold active+upcoming groups
const [groupList, setGroupList] = useState([]);

// For tracking selected groupId per request
const [selectedGroups, setSelectedGroups] = useState({});

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/pending`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      } else {
        console.error('Failed to fetch requests:', data.message);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoading(false);
    }
  };
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

  useEffect(() => {
    fetchPendingRequests();
  }, []);
  useEffect(() => {
    fetchGroups();
  }, []);
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/AdminRequests.jsx
  const getTypeIcon = (type) => {
    switch (type) {
      case 'join_group': return <Users className="type-icon blue" />;
      case 'payment_confirmation': return <DollarSign className="type-icon green" />;
      case 'payout_booking': return <Calendar className="type-icon purple" />;
      case 'leave_group': return <XCircle className="type-icon red" />;
      default: return <Clock className="type-icon gray" />;
    }
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      'join_group': 'Join Group',
      'payment_confirmation': 'Payment',
      'payout_booking': 'Payout Booking',
      'leave_group': 'Leave Group'
    };
    
    const typeClass = `type-badge type-${type.replace('_', '-')}`;
    const typeText = typeMap[type] || 'Unknown';
    
    return <span className={typeClass}>{typeText}</span>;
  };

<<<<<<< HEAD:src/components/AdminRequests.jsx
  const handleApprove = (requestId) => {
    console.log('Approve request:', requestId);
    // TODO: Implement approve logic
  };

  const handleReject = (requestId) => {
    console.log('Reject request:', requestId);
    // TODO: Implement reject logic
=======
    const handleApprove = async (requestId, type) => {
      const payload = { requestId };

      if (type === 'join_group') {
        const groupId = selectedGroups[requestId];
        if (!groupId) {
          return alert('Please select a group before approving.');
        }
        payload.groupId = groupId;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setRequests(prev => prev.filter(r => r.id !== requestId));
          alert('Request approved.');
        } else {
          alert(data.message || 'Failed to approve request.');
        }
      } catch (err) {
        console.error(err);
        alert('Error approving request.');
      }
    };


  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        alert('Request rejected.');
      } else {
        alert(data.message || 'Failed to reject request.');
      }
    } catch (err) {
      console.error(err);
      alert('Error rejecting request.');
    }
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/AdminRequests.jsx
  };

  return (
    <div className="requests-card">
      <div className="card-header">
        <div className="header-content">
          <Clock className="header-icon" />
          <div>
            <h2 className="card-title">Pending Requests</h2>
<<<<<<< HEAD:src/components/AdminRequests.jsx
            <p className="card-subtitle">Review and approve member requests across all groups</p>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>User</th>
                <th>Group</th>
                <th>Amount</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="type-cell">
                      {getTypeIcon(request.type)}
                      {getTypeBadge(request.type)}
                    </div>
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-name">{request.user}</div>
                      <div className="user-email">{request.email}</div>
                    </div>
                  </td>
                  <td className="group-cell">{request.groupNo}</td>
                  <td>
                    {request.amount ? (
                      <span className="amount">₹{request.amount.toLocaleString()}</span>
                    ) : (
                      <span className="na">N/A</span>
                    )}
                  </td>
                  <td className="message-cell">{request.message}</td>
                  <td className="date-cell">
                    {new Date(request.timestamp).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn approve"
                        onClick={() => handleApprove(request.id)}
                      >
                        <CheckCircle className="btn-icon" />
                        Approve
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => handleReject(request.id)}
                      >
                        <XCircle className="btn-icon" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
=======
            <p className="card-subtitle">
              Review and approve member requests across all groups
            </p>
          </div>
        </div>
      </div>

      <div className="card-content">
        {loading ? (
          <p>Loading requests...</p>
        ) : (
          <div className="table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>User</th>
                  <th>Group</th>
                  <th>Amount</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No pending requests
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="type-cell">
                          {getTypeIcon(request.type)}
                          {getTypeBadge(request.type)}
                        </div>
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="user-name">{request.user}</div>
                          <div className="user-email">{request.email}</div>
                        </div>
                      </td>
                      <td className="group-cell">
                        {request.type === "join_group" ? (
                          <select
                            value={selectedGroups[request.id] || ""}
                            onChange={(e) =>
                              setSelectedGroups((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">-- Select Group --</option>
                            {groupList.map((group) => (
                              <option key={group._id} value={group._id}>
                                {group.groupNo} - ₹
                                {group.chitValue.toLocaleString()}
                              </option>
                            ))}
                          </select>
                        ) : (
                          request.groupNo || "—"
                        )}
                      </td>
                      <td>
                        {request.amount ? (
                          <span className="amount">
                            ₹{request.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="na">N/A</span>
                        )}
                      </td>
                      <td className="message-cell">{request.message}</td>
                      <td className="date-cell">
                        {new Date(request.timestamp).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="action-btn approve"
                            onClick={() => handleApprove(request.id,request.type)}
                          >
                            <CheckCircle className="btn-icon" />
                            Approve
                          </button>
                          <button
                            className="action-btn reject"
                            onClick={() => handleReject(request.id)}
                          >
                            <XCircle className="btn-icon" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/AdminRequests.jsx
      </div>
    </div>
  );
};
