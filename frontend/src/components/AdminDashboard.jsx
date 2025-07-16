import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, AlertCircle, Plus, Settings } from 'lucide-react';
import { AdminRequests } from './AdminRequests';
import { GroupManagement } from './GroupManagement';
import './AdminDashboard.css';
import { CreateGroupForm } from './CreateGroupForm';
import { AddMemberForm } from './AddMemberForm';

export const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberForm, setAddMemberForm] = useState(false);

  const [stats, setStats] = useState({
    totalGroups: 0,
    totalMembers: 0,
    pendingRequests: 0,
    monthlyCollection: 0
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Fetch all groups
        const groupsRes = await fetch(`${API_BASE}/group/allGroups`, {
          credentials: 'include'
        });
        const groupsData = await groupsRes.json();
        
        // Fetch all pending requests
        const requestsRes = await fetch(`${API_BASE}/request/pending`, {
          credentials: 'include'
        });
        const requestsData = await requestsRes.json();
        
        // Fetch payment data for this month
        const paymentsRes = await fetch(`${API_BASE}/payment/monthly-collection`, {
          credentials: 'include'
        });
        const paymentsData = await paymentsRes.json();

        if (groupsData.success) {
          const totalGroups = groupsData.groups.length;
          const totalMembers = groupsData.groups.reduce((sum, group) => 
            sum + (group.members?.length || 0), 0);
          
          setStats(prev => ({
            ...prev,
            totalGroups,
            totalMembers
          }));
        }
        
        if (requestsData.success) {
          const pendingRequests = requestsData.requests.filter(
            r => r.status === 'pending'
          ).length;
          
          setStats(prev => ({
            ...prev,
            pendingRequests
          }));
        }
        
        if (paymentsData.success) {
          setStats(prev => ({
            ...prev,
            monthlyCollection: paymentsData.totalCollection || 0
          }));
        }
        
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      }
    };

    fetchAdminStats();
  }, [API_BASE]);

  return (
    <div className="admin-dashboard">
      {/* Admin Welcome Section */}
      <div className="welcome-section admin">
        <h2 className="welcome-title">Admin Dashboard</h2>
        <p className="welcome-subtitle">
          Manage chit fund groups, members, and approve requests
        </p>
      </div>

      {/* Admin Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Groups</span>
            <Calendar className="stat-icon" />
          </div>
          <div className="stat-value blue">{stats.totalGroups}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Members</span>
            <Users className="stat-icon" />
          </div>
          <div className="stat-value green">{stats.totalMembers}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pending Requests</span>
            <AlertCircle className="stat-icon" />
          </div>
          <div className="stat-value red">{stats.pendingRequests}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Monthly Collection</span>
            <DollarSign className="stat-icon" />
          </div>
          <div className="stat-value purple">
            ₹{stats.monthlyCollection.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="admin-actions">
        <button
          className="action-btn primary"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="btn-icon" />
          Create New Group
        </button>
        {showCreateForm && (
          <CreateGroupForm onClose={() => setShowCreateForm(false)} />
        )}

        <button
          className="action-btn secondary"
          onClick={() => setAddMemberForm(true)}
        >
          <Users className="btn-icon" />
          Add Member
        </button>
        {showAddMemberForm && (
            <AddMemberForm onClose={() => setAddMemberForm(false)} />
        )}

        <button className="action-btn secondary">
          <Settings className="btn-icon" />
          Settings
        </button>
      </div>

      {/* Admin Content Tabs */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button
            className={`tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Pending Requests
          </button>
          <button
            className={`tab ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Group Management
          </button>
          <button
            className={`tab ${activeTab === "members" ? "active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Member Management
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "requests" && <AdminRequests />}
          {activeTab === "groups" && <GroupManagement />}
          {activeTab === "members" && (
            <div className="placeholder-card">
              <div className="card-header">
                <h2 className="card-title">Member Management</h2>
                <p className="card-subtitle">
                  Manage all members across groups
                </p>
              </div>
              <div className="card-content">
                <p className="placeholder-text">
                  Member management interface coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};