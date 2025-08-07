import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, AlertCircle, Plus, Settings } from 'lucide-react';
import { AdminRequests } from './AdminRequests';
import { GroupManagement } from './GroupManagement';
import { MemberManagement } from './MemberManagement';
import './AdminDashboard.css';
import { CreateGroupForm } from './CreateGroupForm';
import { AddMemberForm } from './AddMemberForm';
import { apiFetch } from '../lib/api';

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
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const groupsData = await apiFetch(`${API_BASE}/group/allGroups`, { showToast: false });
        const requestsData = await apiFetch(`${API_BASE}/request/pending`, { showToast: false });
        const paymentsData = await apiFetch(`${API_BASE}/payment/monthly-collection`, { showToast: false });
        if (groupsData.success) {
          const totalGroups = groupsData.groups.length;
          const totalMembers = groupsData.groups.reduce((sum, group) =>
            sum + (group.members?.length || 0), 0);
          setStats(prev => ({ ...prev, totalGroups, totalMembers }));
        }
        if (requestsData.success) {
          const pendingRequests = requestsData.requests.filter(
            r => r.status === 'pending'
          ).length;
          setStats(prev => ({ ...prev, pendingRequests }));
        }
        if (paymentsData.success) {
          setStats(prev => ({ ...prev, monthlyCollection: paymentsData.totalCollection || 0 }));
        }
      } catch (error) {
        setStats({ totalGroups: 0, totalMembers: 0, pendingRequests: 0, monthlyCollection: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [API_BASE]);

  if (loading) return <p>Loading admin stats...</p>;

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
          {activeTab === "members" && <MemberManagement />}
        </div>
      </div>
    </div>
  );
};