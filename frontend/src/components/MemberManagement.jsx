import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, MoreHorizontal, UserCheck, UserX, DollarSign, Calendar, Download } from 'lucide-react';
import './MemberManagement.css';

export const MemberManagement = () => {
  const navigate = useNavigate();
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [groups, setGroups] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [uniqueUsers, searchTerm, filterStatus]);

  const fetchData = async () => {
    try {
      // Fetch all groups
      const groupsRes = await fetch(`${API_BASE}/group/allGroups`, {
        credentials: 'include'
      });
      const groupsData = await groupsRes.json();

      if (groupsData.success) {
        setGroups(groupsData.groups);
        
        // Extract unique users from all groups
        const userMap = new Map();
        
        groupsData.groups.forEach(group => {
          if (group.members && group.members.length > 0) {
            group.members.forEach(member => {
              const userId = member.userId._id;
              
              if (!userMap.has(userId)) {
                userMap.set(userId, {
                  userId: member.userId,
                  totalGroups: 0,
                  activeGroups: 0,
                  completedGroups: 0,
                  totalInvestment: 0,
                  groups: []
                });
              }
              
              const user = userMap.get(userId);
              user.totalGroups++;
              user.totalInvestment += member.shareAmount || group.chitValue;
              user.groups.push({
                groupId: group._id,
                groupNo: group.groupNo,
                status: group.status,
                chitValue: group.chitValue,
                shareAmount: member.shareAmount,
                joinDate: member.joinDate,
                role: member.role
              });
              
              if (group.status === 'active') user.activeGroups++;
              if (group.status === 'completed') user.completedGroups++;
            });
          }
        });
        
        setUniqueUsers(Array.from(userMap.values()));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...uniqueUsers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.userId.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (based on active groups)
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'active') return user.activeGroups > 0;
        if (filterStatus === 'completed') return user.completedGroups > 0 && user.activeGroups === 0;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleMemberAction = async (memberId, action) => {
    try {
      const response = await fetch(`${API_BASE}/group/member-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          memberId,
          action
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh data
        fetchData();
        alert(`Member ${action} successfully!`);
      } else {
        alert(data.message || `Failed to ${action} member`);
      }
    } catch (error) {
      console.error(`Failed to ${action} member:`, error);
      alert(`Failed to ${action} member`);
    }
  };

  const updateShareAmount = async (memberId, newAmount) => {
    try {
      const response = await fetch(`${API_BASE}/group/update-share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          memberId,
          shareAmount: newAmount
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
        alert('Share amount updated successfully!');
      } else {
        alert(data.message || 'Failed to update share amount');
      }
    } catch (error) {
      console.error('Failed to update share amount:', error);
      alert('Failed to update share amount');
    }
  };

  const exportMemberData = () => {
    const csvContent = [
      ['Name', 'Email', 'Total Groups', 'Active Groups', 'Total Investment'].join(','),
      ...filteredUsers.map(user => [
        `${user.userId.firstName} ${user.userId.lastName}`,
        user.userId.email,
        user.totalGroups,
        user.activeGroups,
        user.totalInvestment
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={statusClass}>{statusText}</span>;
  };

  return (
    <div className="member-management">
      <div className="management-header">
        <div className="header-content">
          <div className="header-left">
            <Users className="header-icon" />
            <div>
              <h2 className="card-title">Member Management</h2>
              <p className="card-subtitle">Manage unique users across all groups</p>
            </div>
          </div>
          <button className="export-btn" onClick={exportMemberData}>
            <Download className="btn-icon" />
            Export Data
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search members, emails, or groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              <option value="active">With Active Groups</option>
              <option value="completed">Completed Groups Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-section">
        {loading ? (
          <div className="loading-container">
            <p>Loading members...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="members-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Total Groups</th>
                  <th>Active Groups</th>
                  <th>Total Investment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.userId._id}>
                    <td>
                      <div className="member-cell">
                        <div className="member-name">
                          {user.userId.firstName} {user.userId.lastName}
                        </div>
                        <div className="member-email">{user.userId.email}</div>
                      </div>
                    </td>
                    <td className="amount-cell">{user.totalGroups}</td>
                    <td className="amount-cell">
                      <span className={user.activeGroups > 0 ? 'status-active' : 'status-inactive'}>
                        {user.activeGroups}
                      </span>
                    </td>
                    <td className="amount-cell">
                      ₹{user.totalInvestment.toLocaleString()}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button 
                          className="view-groups-btn"
                          onClick={() => navigate(`/admin/user/${user.userId._id}/groups`)}
                        >
                          <UserCheck className="btn-icon" />
                          View Groups
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && !loading && (
              <div className="no-members">
                <p>No users found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};