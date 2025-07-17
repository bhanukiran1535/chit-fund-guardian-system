import { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreHorizontal, UserCheck, UserX, DollarSign, Calendar, Download } from 'lucide-react';
import './MemberManagement.css';

export const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [groups, setGroups] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, filterGroup, filterStatus]);

  const fetchData = async () => {
    try {
      // Fetch all groups
      const groupsRes = await fetch(`${API_BASE}/group/allGroups`,{
        credentials: 'include'
      });
      const groupsData = await groupsRes.json();

      if (groupsData.success) {
        setGroups(groupsData.groups);
        
        // Extract all members from all groups
        const allMembers = [];
        groupsData.groups.forEach(group => {
          if (group.members && group.members.length > 0) {
            group.members.forEach(member => {
              allMembers.push({
                ...member,
                groupId: group._id,
                groupNo: group.groupNo,
                groupStatus: group.status,
                chitValue: group.chitValue,
                joinDate: member.joinDate || group.createdAt
              });
            });
          }
        });
        setMembers(allMembers);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.userId.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.userId.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.groupNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Group filter
    if (filterGroup !== 'all') {
      filtered = filtered.filter(member => member.groupId === filterGroup);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => member.groupStatus === filterStatus);
    }

    setFilteredMembers(filtered);
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
      ['Name', 'Email', 'Group', 'Status', 'Chit Value', 'Join Date', 'Share Amount'].join(','),
      ...filteredMembers.map(member => [
        member.name || 'N/A',
        member.email || 'N/A',
        member.groupNo || 'N/A',
        member.groupStatus || 'N/A',
        member.chitValue || 0,
        member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A',
        member.shareAmount || member.chitValue || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members_data.csv';
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
              <p className="card-subtitle">Manage all members across all groups</p>
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
            <label className="filter-label">Group:</label>
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Groups</option>
              {groups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.groupNo}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
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
                  <th>Member</th>
                  <th>Group</th>
                  <th>Status</th>
                  <th>Chit Value</th>
                  <th>Share Amount</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr key={`${member.groupId}-${member._id || index}`}>
                    <td>
                      <div className="member-cell">
                        <div className="member-name">{member.userId.firstName || 'Unknown'}</div>
                        <div className="member-email">{member.userId.email || 'No email'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="group-cell">
                        <div className="group-name">{member.groupNo}</div>
                      </div>
                    </td>
                    <td>{getStatusBadge(member.groupStatus)}</td>
                    <td className="amount-cell">
                      ₹{member.chitValue?.toLocaleString()}
                    </td>
                    <td>
                      <div className="share-amount-cell">
                        <input
                          type="number"
                          defaultValue={member.shareAmount || member.chitValue}
                          className="share-input"
                          onBlur={(e) => {
                            const newAmount = parseInt(e.target.value);
                            if (newAmount !== (member.shareAmount || member.chitValue)) {
                              updateShareAmount(member._id, newAmount);
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="date-cell">
                      {member.joinDate 
                        ? new Date(member.joinDate).toLocaleDateString('en-GB')
                        : 'N/A'
                      }
                    </td>
                    <td>
                      <div className="actions-cell">
                        <div className="dropdown">
                          <button className="dropdown-btn">
                            <MoreHorizontal className="btn-icon" />
                          </button>
                          <div className="dropdown-content">
                            <button 
                              className="dropdown-item"
                              onClick={() => setSelectedMember(member)}
                            >
                              <UserCheck className="item-icon" />
                              View Details
                            </button>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleMemberAction(member._id, 'approve')}
                            >
                              <UserCheck className="item-icon" />
                              Approve
                            </button>
                            <button 
                              className="dropdown-item danger"
                              onClick={() => {
                                if (confirm('Are you sure you want to remove this member?')) {
                                  handleMemberAction(member._id, 'remove');
                                }
                              }}
                            >
                              <UserX className="item-icon" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && !loading && (
              <div className="no-members">
                <p>No members found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="member-modal-overlay" onClick={() => setSelectedMember(null)}>
          <div className="member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Member Details</h3>
              <button onClick={() => setSelectedMember(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedMember.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedMember.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Group:</span>
                <span className="detail-value">{selectedMember.groupNo}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Group Status:</span>
                <span className="detail-value">{getStatusBadge(selectedMember.groupStatus)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Chit Value:</span>
                <span className="detail-value">₹{selectedMember.chitValue?.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Join Date:</span>
                <span className="detail-value">
                  {selectedMember.joinDate 
                    ? new Date(selectedMember.joinDate).toLocaleDateString('en-GB')
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};