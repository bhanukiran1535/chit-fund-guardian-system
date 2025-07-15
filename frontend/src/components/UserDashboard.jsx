<<<<<<< HEAD:src/components/UserDashboard.jsx

import { useState } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
import { Users, Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { MonthlyPayments } from './MonthlyPayments';
import { RequestNotifications } from './RequestNotifications';
<<<<<<< HEAD:src/components/UserDashboard.jsx
=======
import { ChitValueBanner } from './ChitValueBanner';
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
import './UserDashboard.css';

export const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('groups');
<<<<<<< HEAD:src/components/UserDashboard.jsx
  
  // Mock data - replace with actual API calls
=======
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
  const [stats, setStats] = useState({
    activeGroups: 0,
    totalPaid: 0,
    upcomingPayments: 0,
    pendingRequests: 0
  });

<<<<<<< HEAD:src/components/UserDashboard.jsx
  const [groups] = useState([
    {
      id: '1',
      groupNo: 'G001',
      chitValue: 100000,
      tenure: 20,
      startMonth: 'January 2024',
      currentMonth: 3,
      status: 'active',
      nextPaymentDue: '2024-03-15',
      myPaymentStatus: 'due'
    },
    {
      id: '2',
      groupNo: 'G002',
      chitValue: 50000,
      tenure: 10,
      startMonth: 'March 2024',
      currentMonth: 1,
      status: 'active',
      nextPaymentDue: '2024-03-20',
      myPaymentStatus: 'paid'
    }
  ]);

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="welcome-title">Welcome back, {user.alias}!</h2>
        <p className="welcome-subtitle">Manage your chit fund groups and track your payments</p>
      </div>

      {/* Stats Cards */}
=======
  //   const [groups] = useState([  // Placeholder: Replace with real joined groups later
  //   {
  //     id: '1',
  //     groupNo: 'G001',
  //     chitValue: 100000,
  //     tenure: 20,
  //     startMonth: 'January 2024',
  //     currentMonth: 3,
  //     status: 'active',
  //     nextPaymentDue: '2024-03-15',
  //     myPaymentStatus: 'due'
  //   },
  //   {
  //     id: '2',
  //     groupNo: 'G002',
  //     chitValue: 50000,
  //     tenure: 10,
  //     startMonth: 'March 2024',
  //     currentMonth: 1,
  //     status: 'active',
  //     nextPaymentDue: '2024-03-20',
  //     myPaymentStatus: 'paid'
  //   }
  // ]);
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

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
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
<<<<<<< HEAD:src/components/UserDashboard.jsx
          <div className="stat-value green">₹{stats.totalPaid.toLocaleString()}</div>
=======
          <div className="stat-value green">
            ₹{stats.totalPaid.toLocaleString()}
          </div>
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
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

<<<<<<< HEAD:src/components/UserDashboard.jsx
      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-list">
          <button 
            className={`tab ${activeTab === 'groups' ? 'active' : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            My Groups
          </button>
          <button 
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Monthly Payments
          </button>
          <button 
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
=======
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
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
          >
            Notifications
          </button>
        </div>

<<<<<<< HEAD:src/components/UserDashboard.jsx
        <div className="tab-content">
          {activeTab === 'groups' && (
            <div className="groups-grid">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
=======
         <div className="tab-content">
          {activeTab === "groups" && (
            <div className="groups-grid">
              {mergedGroups.map((group) => (
                <GroupCard key={group._id} group={group} />
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
              ))}
            </div>
          )}

<<<<<<< HEAD:src/components/UserDashboard.jsx
          {activeTab === 'payments' && (
            <MonthlyPayments groups={groups} />
          )}

          {activeTab === 'notifications' && (
            <RequestNotifications />
          )}
=======
          {activeTab === "payments" && <MonthlyPayments groups={mergedGroups} />}

          {activeTab === "notifications" && <RequestNotifications />}
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/UserDashboard.jsx
        </div>
      </div>
    </div>
  );
};
