import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, Users, DollarSign } from 'lucide-react';
import './MonthUserStatus.css';

export const MonthUserStatus = ({ group, monthData, onBack, adminMode = false }) => {
  const [memberStatuses, setMemberStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchMonthUserStatuses();
  }, [group, monthData]);

  const fetchMonthUserStatuses = async () => {
    try {
      const response = await fetch(`${API_BASE}/month/group/${group._id}/${monthData.monthName}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        // Map the actual payment data with group members
        const enrichedStatuses = group.members.map(member => {
          const monthDetail = data.monthDetails?.find(md => md.userId === member.userId._id);
          
          return {
            ...member,
            userInfo: member.userId,
            monthStatus: monthDetail?.status || 'due',
            paymentDate: monthDetail?.paymentDate,
            paymentMethod: monthDetail?.paymentMethod,
            monthDue: monthDetail?.monthDue || (member.shareAmount / group.tenure),
            prebookedThisMonth: monthDetail?.prebookedBy === member.userId._id
          };
        });

        setMemberStatuses(enrichedStatuses);
      }
    } catch (error) {
      console.error('Failed to fetch month user statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="status-icon paid" />;
      case 'pending': return <Clock className="status-icon pending" />;
      case 'due': return <AlertTriangle className="status-icon due" />;
      default: return <Clock className="status-icon" />;
    }
  };

  const markAsPaid = async (userId) => {
    if (!adminMode) return;
    
    try {
      const response = await fetch(`${API_BASE}/payment/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          groupId: group._id,
          userId,
          monthName: monthData.monthName,
          paymentMethod: 'admin_marked',
          paymentDate: new Date().toISOString()
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchMonthUserStatuses(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const calculateStats = () => {
    const paidCount = memberStatuses.filter(m => m.monthStatus === 'paid').length;
    const dueCount = memberStatuses.filter(m => m.monthStatus === 'due').length;
    const totalCollection = memberStatuses
      .filter(m => m.monthStatus === 'paid')
      .reduce((sum, m) => sum + m.monthDue, 0);

    return { paidCount, dueCount, totalCollection };
  };

  const stats = calculateStats();

  return (
    <div className="month-user-status">
      <div className="status-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Months
        </button>
        
        <div className="month-info">
          <h2>Group {group.groupNo} - {monthData.monthName}</h2>
          <div className="month-stats">
            <div className="stat-card">
              <Users className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{stats.paidCount}/{memberStatuses.length}</span>
                <span className="stat-label">Paid Members</span>
              </div>
            </div>
            <div className="stat-card">
              <DollarSign className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">₹{stats.totalCollection.toLocaleString()}</span>
                <span className="stat-label">Total Collected</span>
              </div>
            </div>
            <div className="stat-card">
              <AlertTriangle className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{stats.dueCount}</span>
                <span className="stat-label">Due Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="members-container">
        {loading ? (
          <div className="loading">Loading member statuses...</div>
        ) : (
          <div className="members-grid">
            {memberStatuses.map((member, index) => (
              <div 
                key={index} 
                className={`member-card ${member.monthStatus} ${member.prebookedThisMonth ? 'prebooked-winner' : ''}`}
              >
                {member.prebookedThisMonth && (
                  <div className="prebook-banner">
                    🎯 Month Winner (Prebooked)
                  </div>
                )}
                
                <div className="member-header">
                  <div className="member-avatar">
                    {member.userInfo.firstName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <h4>{member.userInfo.firstName} {member.userInfo.lastName}</h4>
                    <p>{member.userInfo.email}</p>
                    <span className={`role-badge ${member.role}`}>
                      {member.role === 'foreman' ? '👑 Foreman' : 'Member'}
                    </span>
                  </div>
                  <div className="status-indicator">
                    {getStatusIcon(member.monthStatus)}
                  </div>
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <span className="label">Amount Due:</span>
                    <span className="value">₹{member.monthDue.toLocaleString()}</span>
                  </div>
                  
                  {member.monthStatus === 'paid' && member.paymentDate && (
                    <div className="detail-row">
                      <span className="label">Paid On:</span>
                      <span className="value">{new Date(member.paymentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {member.monthStatus === 'paid' && member.paymentMethod && (
                    <div className="detail-row">
                      <span className="label">Method:</span>
                      <span className="value">{member.paymentMethod}</span>
                    </div>
                  )}
                </div>

                <div className="member-actions">
                  <span className={`status-badge ${member.monthStatus}`}>
                    {member.monthStatus === 'paid' ? 'Paid' : 
                     member.monthStatus === 'pending' ? 'Pending' : 'Due'}
                  </span>
                  
                  {adminMode && member.monthStatus !== 'paid' && (
                    <button 
                      className="mark-paid-btn"
                      onClick={() => markAsPaid(member.userInfo._id)}
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};