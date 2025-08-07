import { useState, useEffect } from 'react';
import { X, Calendar, Users, DollarSign, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import './GroupDetailsView.css';
import { apiFetch } from '../lib/api';

export const GroupDetailsView = ({ group, onClose }) => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthMembers, setMonthMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() =>{
    if (group) {
      fetchGroupMonths();
    }
  }, [group]);

  const fetchGroupMonths = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/month/group/${group._id}`, { showToast: false });
      if (data.success) {
        setMonths(data.months || []);
      }
    } catch (error) {
      setMonths([]);
    }
  };

  const fetchMonthMembers = async (monthId) => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API_BASE}/payment/month/${monthId}`, { showToast: false });
      if (data.success) {
        setMonthMembers(data.payments || []);
      }
    } catch (error) {
      setMonthMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    fetchMonthMembers(month._id);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="status-icon completed" />;
      case 'pending':
        return <Clock className="status-icon pending" />;
      case 'failed':
        return <XCircle className="status-icon failed" />;
      default:
        return <Clock className="status-icon pending" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={statusClass}>{statusText}</span>;
  };

  if (selectedMonth) {
    return (
      <div className="group-details-overlay">
        <div className="group-details-modal month-details">
          <div className="modal-header">
            <button className="back-btn" onClick={() => setSelectedMonth(null)}>
              <ArrowLeft className="btn-icon" />
              Back to Months
            </button>
            <button className="close-btn" onClick={onClose}>
              <X className="btn-icon" />
            </button>
          </div>

          <div className="month-header">
            <h2 className="month-title">
              {new Date(selectedMonth.month).toLocaleDateString('en-GB', { 
                month: 'long', 
                year: 'numeric' 
              })} - {group.groupNo}
            </h2>
            <div className="month-stats">
              <div className="month-stat">
                <span className="stat-label">Winner:</span>
                <span className="stat-value">{selectedMonth.winner || 'Not decided'}</span>
              </div>
              <div className="month-stat">
                <span className="stat-label">Auction Amount:</span>
                <span className="stat-value">₹{selectedMonth.auctionAmount?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="members-section">
            <h3 className="section-title">Member Payments</h3>
            {loading ? (
              <div className="loading-text">Loading members...</div>
            ) : (
              <div className="members-table-container">
                <table className="members-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Payment Status</th>
                      <th>Amount</th>
                      <th>Prebook Info</th>
                      <th>Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthMembers.map((payment) => (
                      <tr key={payment._id}>
                        <td>
                          <div className="member-info">
                            <div className="member-name">{payment.user?.name || payment.memberName}</div>
                            <div className="member-email">{payment.user?.email}</div>
                          </div>
                        </td>
                        <td>
                          <div className="status-cell">
                            {getStatusIcon(payment.status)}
                            {getStatusBadge(payment.status)}
                          </div>
                        </td>
                        <td className="amount-cell">
                          ₹{payment.amount?.toLocaleString()}
                        </td>
                        <td>
                          {payment.prebookMonth ? (
                            <div className="prebook-info">
                              <span className="prebook-label">Prebooked:</span>
                              <span className="prebook-month">
                                {new Date(payment.prebookMonth).toLocaleDateString('en-GB', { 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="no-prebook">No prebook</span>
                          )}
                        </td>
                        <td className="date-cell">
                          {payment.paymentDate 
                            ? new Date(payment.paymentDate).toLocaleDateString('en-GB')
                            : 'Not paid'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-details-overlay">
      <div className="group-details-modal">
        <div className="modal-header">
          <h2 className="modal-title">Group Details - {group.groupNo}</h2>
          <button className="close-btn" onClick={onClose}>
            <X className="btn-icon" />
          </button>
        </div>

        <div className="group-info-section">
          <div className="group-info-grid">
            <div className="info-card">
              <DollarSign className="info-icon" />
              <div className="info-content">
                <span className="info-label">Chit Value</span>
                <span className="info-value">₹{group.chitValue?.toLocaleString()}</span>
              </div>
            </div>
            <div className="info-card">
              <Users className="info-icon" />
              <div className="info-content">
                <span className="info-label">Members</span>
                <span className="info-value">{group.members?.length || 0}</span>
              </div>
            </div>
            <div className="info-card">
              <Calendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Tenure</span>
                <span className="info-value">{group.tenure} months</span>
              </div>
            </div>
            <div className="info-card">
              <Calendar className="info-icon" />
              <div className="info-content">
                <span className="info-label">Started</span>
                <span className="info-value">
                  {new Date(group.startMonth).toLocaleDateString('en-GB', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="months-section">
          <h3 className="section-title">Monthly Progress</h3>
          <div className="months-grid">
            {months.length > 0 ? (
              months.map((month) => (
                <div 
                  key={month._id} 
                  className="month-card clickable"
                  onClick={() => handleMonthClick(month)}
                >
                  <div className="month-header-small">
                    <h4 className="month-title-small">
                      {new Date(month.month).toLocaleDateString('en-GB', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </h4>
                    {getStatusBadge(month.status || 'pending')}
                  </div>
                  <div className="month-details-small">
                    <div className="month-detail">
                      <span className="detail-label">Winner:</span>
                      <span className="detail-value">{month.winner || 'Pending'}</span>
                    </div>
                    {month.auctionAmount && (
                      <div className="month-detail">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value">₹{month.auctionAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-months">
                <p>No monthly data available for this group.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};