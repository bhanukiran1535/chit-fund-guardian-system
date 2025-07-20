import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { GroupMonthDetails } from './GroupMonthDetails';
import './UserGroupsView.css';

export const UserGroupsView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (selectedGroup && user) {
      navigate(`/user/group/${selectedGroup._id}/details`, {
        state: {
          group: selectedGroup,
          adminMode: true,
          userId: user._id,
        }
      });
    }
  }, [selectedGroup, user, navigate]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      // Fetch user details
      const userRes = await fetch(`${API_BASE}/user/${userId}`, {
        credentials: 'include'
      });
      const userData = await userRes.json();

      if (userData.success) {
        setUser(userData.user);
        await fetchUserGroups(userData.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async (userData) => {
    try {
      const response = await fetch(`${API_BASE}/group/allGroups`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        // Filter groups that contain this user
        const filteredGroups = data.groups.filter(group => 
          group.members.some(member => member.userId._id === userData._id)
        );

        // Add user-specific data to each group
        const enrichedGroups = filteredGroups.map(group => {
          const userMember = group.members.find(member => member.userId._id === userData._id);
          return {
            ...group,
            userRole: userMember?.role || 'member',
            userShareAmount: userMember?.shareAmount || group.chitValue,
            userJoinDate: userMember?.joinDate,
            userPreBookedMonth: userMember?.preBookedMonth
          };
        });

        setUserGroups(enrichedGroups);
      }
    } catch (error) {
      console.error('Failed to fetch user groups:', error);
    }
  };

  if (loading) {
    return (
      <div className="user-groups-view">
        <div className="loading">Loading user data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-groups-view">
        <div className="loading">User not found</div>
      </div>
    );
  }

  const calculateUserStats = () => {
    const totalInvestment = userGroups.reduce((sum, group) => sum + (group.userShareAmount || 0), 0);
    const activeGroups = userGroups.filter(group => group.status === 'active').length;
    const completedGroups = userGroups.filter(group => group.status === 'completed').length;

    return { totalInvestment, activeGroups, completedGroups };
  };



  const stats = calculateUserStats();

  return (
    <div className="user-groups-view">
      <div className="view-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back to Admin Dashboard
        </button>
        
        <div className="user-info-header">
          <div className="user-avatar">
            {user.firstName?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h2>{user.firstName} {user.lastName}</h2>
            <p>{user.email}</p>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-value">{userGroups.length}</span>
                <span className="stat-label">Total Groups</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.activeGroups}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">₹{stats.totalInvestment.toLocaleString()}</span>
                <span className="stat-label">Total Investment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="groups-section">
        <h3>Groups Participation</h3>
        {loading ? (
          <div className="loading">Loading user groups...</div>
        ) : userGroups.length === 0 ? (
          <div className="no-groups">
            <p>This user is not part of any groups yet.</p>
          </div>
        ) : (
          <div className="groups-grid">
            {userGroups.map(group => (
              <div key={group._id} className="group-card-container">
                <div className="group-card-admin">
                  <div className="group-header">
                    <div className="group-title">
                      <h4>Group {group.groupNo}</h4>
                      <span className={`status-badge status-${group.status}`}>
                        {group.status}
                      </span>
                    </div>
                    <div className="group-actions">
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="group-info">
                    <div className="info-row">
                      <DollarSign size={16} className="info-icon" />
                      <span>Chit Value: ₹{group.chitValue.toLocaleString()}</span>
                    </div>
                    <div className="info-row">
                      <Calendar size={16} className="info-icon" />
                      <span>Tenure: {group.tenure} months</span>
                    </div>
                    <div className="info-row">
                      <Users size={16} className="info-icon" />
                      <span>Members: {group.members.length}</span>
                    </div>
                    <div className="info-row">
                      <TrendingUp size={16} className="info-icon" />
                      <span>User Share: ₹{group.userShareAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {group.userRole === 'foreman' && (
                    <div className="foreman-badge">
                      👑 Foreman
                    </div>
                  )}

                  {group.userPreBookedMonth && (
                    <div className="prebook-info">
                      🎯 Pre-booked: {group.userPreBookedMonth}
                    </div>
                  )}

                  <div className="join-date">
                    Joined: {group.userJoinDate ? new Date(group.userJoinDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};