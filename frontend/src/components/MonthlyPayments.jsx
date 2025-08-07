
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './MonthlyPayments.css';
import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export const MonthlyPayments = ({ groups }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch all months for all groups
        const groupIds = groups.map(g => g._id);
        const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/month/my`, {
          method: 'POST',
          body: { groupIds },
          showToast: false
        });
        if (data.success) {
          setPayments(data.months || []);
        } else {
          setError(data.message || 'Failed to fetch payments');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    if (groups && groups.length > 0) fetchPayments();
    else setLoading(false);
  }, [groups]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="status-icon green" />;
      case 'due': return <AlertCircle className="status-icon red" />;
      case 'pending': return <Clock className="status-icon yellow" />;
      default: return <Clock className="status-icon gray" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={statusClass}>{statusText}</span>;
  };

  if (loading) return <div className="card-content"><div className="loading">Loading payments...</div></div>;
  if (error) return <div className="card-content"><div className="error">{error}</div></div>;
  if (!payments || payments.length === 0) return <div className="card-content"><div className="empty-state">No payments found.</div></div>;

  return (
    <div className="payments-card">
      <div className="card-header">
        <div className="header-content">
          <DollarSign className="header-icon" />
          <div>
            <h2 className="card-title">Monthly Payments</h2>
            <p className="card-subtitle">Track your monthly contributions across all groups</p>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Group</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="font-medium">{payment.groupNo || payment.groupId}</td>
                  <td>{payment.monthName}</td>
                  <td className="amount"> ₹{payment.amount?.toLocaleString() || ''}</td>
                  <td>{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : ''}</td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                  </td>
                  <td>
                    {payment.status === 'due' ? (
                      <button className="action-btn primary">Pay Now</button>
                    ) : payment.status === 'paid' ? (
                      <button className="action-btn disabled" disabled>
                        Paid {payment.paymentDate && `on ${new Date(payment.paymentDate).toLocaleDateString()}`}
                      </button>
                    ) : (
                      <button className="action-btn secondary">View Details</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
