import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, AlertTriangle, Users, DollarSign, Clock } from 'lucide-react';
import { MonthUserStatus } from './MonthUserStatus';
import './GroupMonthManagement.css';
import { apiFetch } from '../lib/api';

export const GroupMonthManagement = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      // Fetch group details
      const groupData = await apiFetch(`${API_BASE}/group/${groupId}`, { showToast: false });
      if (groupData.success) {
        setGroup(groupData.group);
        await fetchGroupMonths(groupData.group);
      }
    } catch (error) {
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMonths = async (groupData) => {
    try {
      // Generate all months from start to current
      const startDate = new Date(groupData.startMonth);
      const currentDate = new Date();
      const generatedMonths = [];

      for (let i = 0; i < groupData.tenure; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);
        const monthName = `${monthDate.toLocaleDateString('en-US', { month: 'long' })} ${monthDate.getFullYear()}`;
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
      // ✅ PERFORMANCE FIX: Fetch all months data in a single batch API call
      const monthNames = generatedMonths.map(m => m.monthName);
      try {
        const response = await fetch(`${API_BASE}/month/group/batch/${groupData._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ monthNames })
        });
        const batchData = await response.json();
        
        if (batchData.success) {
          // Map batch data to months
          generatedMonths.forEach(month => {
            const monthData = batchData.monthsData.find(data => data.monthName === month.monthName);
            if (monthData) {
              month.membersData = monthData.monthDetails || [];
              // Update status based on actual payments
              const paidMembers = month.membersData.filter(m => m.status === 'paid').length;
              const totalMembers = groupData.members.length;
              
              if (paidMembers === totalMembers) {
                month.status = 'cleared';
              } else if (paidMembers > 0) {
                month.status = 'pending';
              } else if (month.monthDate <= currentDate) {
                month.status = 'due';
              }
            }
          });
        } else {
          // Fallback to individual calls if batch endpoint doesn't exist
          console.warn('Batch endpoint not available, falling back to individual calls');
          await fetchMonthsIndividually(generatedMonths, groupData);
        }
      } catch (error) {
        console.warn('Batch fetch failed, falling back to individual calls:', error);
        await fetchMonthsIndividually(generatedMonths, groupData);
      }
      setMonths(generatedMonths);
    } catch (error) {
      setMonths([]);
    }
  };

  // Fallback function for individual API calls
  const fetchMonthsIndividually = async (generatedMonths, groupData) => {
    for (const month of generatedMonths) {
      try {
        const response = await fetch(`${API_BASE}/month/group/${groupData._id}/${month.monthName}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          month.membersData = data.monthDetails || [];
          // Update status based on actual payments
          const paidMembers = month.membersData.filter(m => m.status === 'paid').length;
          const totalMembers = groupData.members.length;
          
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
  };

  if (loading) {
    return (
      <div className="group-month-management">
        <div className="loading">Loading group data...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-month-management">
        <div className="loading">Group not found</div>
      </div>
    );
  }

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
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back to Admin Dashboard
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