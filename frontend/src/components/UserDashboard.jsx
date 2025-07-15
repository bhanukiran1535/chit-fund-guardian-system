import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { MonthlyPayments } from './MonthlyPayments';
import { RequestNotifications } from './RequestNotifications';
import { ChitValueBanner } from './ChitValueBanner';
import './UserDashboard.css';

export const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [stats, setStats] = useState({
    activeGroups: 0,
    totalPaid: 0,
    upcomingPayments: 0,
    pendingRequests: 0
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [groups, setGroups] = useState([]);
  const [monthRecords, setMonthRecords] = useState([]);
  const [mergedGroups, setMergedGroups] = useState([]);

  useEffect(() => {
    const fetchMyGroups = async () => {
      const res = await fetch(`${API_BASE}/group/my`, {
        credentials: 'include'
      });
      const data = await res.json();

      if (data.success) {
        const groupsWithShare = data.groups.map(group => {
          const userInfo = group.members?.[0] || {};
          return {
            ...group,
            shareAmount: userInfo.shareAmount || 0,
            hasPrebooked: userInfo.hasPrebooked || false,
            preBookedMonth: userInfo.preBookedMonth || null,
            extraMonthlyPayment: userInfo.extraMonthlyPayment || 0
          };
        });

        setGroups(groupsWithShare);
      }
    };

    fetchMyGroups();
  }, []);

  useEffect(() => {
    const fetchMonthData = async () => {
      const groupIds = groups.map(g => g._id);
      const res = await fetch(`${API_BASE}/month/my`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groupIds })
      });
      const data = await res.json();
      if (data.success) setMonthRecords(data.months);
    };

    if (groups.length > 0) fetchMonthData();
  }, [groups]);

  useEffect(() => {
    const now = new Date();
    const computedGroups = groups.map(group => {
      const start = new Date(group.startMonth);
      const groupMonths = monthRecords.filter(m => m.groupId === group._id);

      const monthsPassed = now.getFullYear() * 12 + now.getMonth();
      const startMonthValue = start.getFullYear() * 12 + start.getMonth();
      const currentMonth = monthsPassed - startMonthValue + 1;
      
      let myPaymentStatus = 'upcoming';
      if (currentMonth > 0) {
        const pastMonths = groupMonths.filter(m => {
          const [monthName, year] = m.monthName.split(' ');
          const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
          const monthValue = parseInt(year) * 12 + monthIndex;
          return monthValue <= monthsPassed;
        });
        
        if (pastMonths.some(m => m.status === 'due')) {
          myPaymentStatus = 'due';
        } else if (pastMonths.some(m => m.status === 'pending')) {
          myPaymentStatus = 'pending';
        } else {
          myPaymentStatus = 'paid';
        }
      }
      
      const nextDue = groupMonths.find(
        m => m.status === 'due' || m.status === 'pending'
      )?.monthName;
      
      return {
        ...group,
        currentMonth: currentMonth > 0 ? currentMonth : 0,
        myPaymentStatus,
        nextPaymentDue: nextDue || null,
      };
    });

    setMergedGroups(computedGroups);
    
    // Calculate real-time stats
    const activeGroups = computedGroups.filter(g => g.status === 'active').length;
    const totalPaid = monthRecords
      .filter(m => m.status === 'paid')
      .reduce((sum, m) => sum + (m.amount || 0), 0);
    const upcomingPayments = monthRecords
      .filter(m => m.status === 'due' || m.status === 'pending').length;
    
    setStats({
      activeGroups,
      totalPaid,
      upcomingPayments,
      pendingRequests: 0 // This would need API call to get pending join requests
    });
  }, [monthRecords]);

  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2 className="welcome-title">Welcome back, {user.alias}!</h2>
        <p className="welcome-subtitle">
          Manage your chit fund groups and track your payments
        </p>
      </div>
      
      <ChitValueBanner/>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Groups</span>
            <Users className="stat-icon" />
          </div>
          <div className="stat-value blue">{stats.activeGroups}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Paid</span>
            <DollarSign className="stat-icon" />
          </div>
          <div className="stat-value green">
            ₹{stats.totalPaid.toLocaleString()}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Upcoming Payments</span>
            <Clock className="stat-icon" />
          </div>
          <div className="stat-value orange">{stats.upcomingPayments}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Pending Requests</span>
            <AlertCircle className="stat-icon" />
          </div>
          <div className="stat-value red">{stats.pendingRequests}</div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          <button
            className={`tab ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            My Groups
          </button>
          <button
            className={`tab ${activeTab === "payments" ? "active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Monthly Payments
          </button>
          <button
            className={`tab ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "groups" && (
            <div className="groups-grid">
              {mergedGroups.map((group) => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          )}

          {activeTab === "payments" && <MonthlyPayments groups={mergedGroups} />}

          {activeTab === "notifications" && <RequestNotifications />}
        </div>
      </div>
    </div>
  );
};