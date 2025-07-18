import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, CheckCircle, AlertTriangle, Users, DollarSign, Clock } from 'lucide-react';
import { MonthUserStatus } from './MonthUserStatus';
import './GroupMonthManagement.css';

export const GroupMonthManagement = ({ group, onBack }) => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchGroupMonths();
  }, [group]);

  const fetchGroupMonths = async () => {
    try {
      // Generate all months from start to current
      const startDate = new Date(group.startMonth);
      const currentDate = new Date();
      const generatedMonths = [];

      for (let i = 0; i < group.tenure; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);
        
        const monthName = `${monthDate.toLocaleDateString('en-US', { month: 'long' })} ${monthDate.getFullYear()}`;
        
        // Determine status based on current date
        let status = 'upcoming';
        if (monthDate <= currentDate) {
          const nextMonth = new Date(monthDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          status = nextMonth <= currentDate ? 'due' : 'pending';
        }

        generatedMonths.push({
          monthName,
          monthDate,
          status,
          membersData: []
        });
      }

      // Fetch actual payment data for each month
      for (const month of generatedMonths) {
        try {
          const response = await fetch(`${API_BASE}/month/group/${group._id}/${month.monthName}`, {
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.success) {
            month.membersData = data.monthDetails || [];
            // Update status based on actual payments
            const paidMembers = month.membersData.filter(m => m.status === 'paid').length;
            const totalMembers = group.members.length;
            
            if (paidMembers === totalMembers) {
              month.status = 'cleared';
            } else if (paidMembers > 0) {
              month.status = 'pending';
            } else if (month.monthDate <= currentDate) {
              month.status = 'due';
            }
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${month.monthName}:`, error);
        }
      }

      setMonths(generatedMonths);
    } catch (error) {
      console.error('Failed to fetch group months:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'cleared': return <CheckCircle className="status-icon cleared" />;
      case 'pending': return <Clock className="status-icon pending" />;
      case 'due': return <AlertTriangle className="status-icon due" />;
      case 'upcoming': return <Calendar className="status-icon upcoming" />;
      default: return <Calendar className="status-icon" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'cleared': return 'All Paid';
      case 'pending': return 'Partial Payment';
      case 'due': return 'Payment Due';
      case 'upcoming': return 'Upcoming';
      default: return status;
    }
  };

  const calculateMonthStats = (month) => {
    const totalMembers = group.members.length;
    const paidMembers = month.membersData.filter(m => m.status === 'paid').length;
    const dueMembers = totalMembers - paidMembers;
    const totalCollected = month.membersData
      .filter(m => m.status === 'paid')
      .reduce((sum, m) => sum + (m.monthDue || 0), 0);

    return { totalMembers, paidMembers, dueMembers, totalCollected };
  };

  if (selectedMonth) {
    return (
      <MonthUserStatus 
        group={group}
        monthData={selectedMonth}
        onBack={() => setSelectedMonth(null)}
        adminMode={true}
      />
    );
  }

  return (
    <div className="group-month-management">
      <div className="management-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Groups
        </button>
        
        <div className="group-info">
          <h2>Group {group.groupNo} - Monthly Management</h2>
          <div className="group-stats">
            <div className="stat-item">
              <DollarSign className="stat-icon" />
              <span>₹{group.chitValue.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <Users className="stat-icon" />
              <span>{group.members.length} Members</span>
            </div>
            <div className="stat-item">
              <Calendar className="stat-icon" />
              <span>{group.tenure} Months</span>
            </div>
          </div>
        </div>
      </div>

      <div className="months-container">
        {loading ? (
          <div className="loading">Loading months data...</div>
        ) : (
          <div className="months-grid">
            {months.map((month, index) => {
              const stats = calculateMonthStats(month);
              const progressPercentage = (stats.paidMembers / stats.totalMembers) * 100;

              return (
                <div 
                  key={index} 
                  className={`month-card ${month.status}`}
                  onClick={() => setSelectedMonth(month)}
                >
                  <div className="month-header">
                    <div className="month-title">
                      <h3>{month.monthName}</h3>
                      {getStatusIcon(month.status)}
                    </div>
                    <div className={`status-badge ${month.status}`}>
                      {getStatusText(month.status)}
                    </div>
                  </div>

                  <div className="month-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      {stats.paidMembers} / {stats.totalMembers} paid
                    </div>
                  </div>

                  <div className="month-stats">
                    <div className="stat-row">
                      <span className="stat-label">Collected:</span>
                      <span className="stat-value">₹{stats.totalCollected.toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Due Members:</span>
                      <span className={`stat-value ${stats.dueMembers > 0 ? 'warning' : 'success'}`}>
                        {stats.dueMembers}
                      </span>
                    </div>
                  </div>

                  <div className="month-actions">
                    <button className="view-details-btn">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};