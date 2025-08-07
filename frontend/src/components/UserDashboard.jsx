import { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, Clock, AlertCircle, BarChart2, CalendarCheck, Send, CheckCircle } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { MonthlyPayments } from './MonthlyPayments';
import { RequestNotifications } from './RequestNotifications';
import { ChitValueBanner } from './ChitValueBanner';
import './UserDashboard.css';
import { getCsrfToken } from '../lib/utils';
import { apiFetch } from '../lib/api';

// Add StatCard component
const StatCard = ({ title, value, icon }) => (
  <div className="flex flex-col items-center bg-white rounded-xl shadow p-4 transition hover:scale-105 hover:shadow-lg">
    <div className="mb-2 text-blue-700">{icon}</div>
    <div className="font-semibold text-lg text-gray-800">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{title}</div>
  </div>
);

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
  const [prebookStats, setPrebookStats] = useState({ sent: 0, approved: 0 });
  const [lastPaymentDate, setLastPaymentDate] = useState(null);

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const data = await apiFetch(`${API_BASE}/group/my`, { showToast: false });
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
      } catch (err) {
        setGroups([]);
      }
    };
    fetchMyGroups();
  }, []);

  useEffect(() => {
    const fetchMonthData = async () => {
      try {
        const groupIds = groups.map(g => g._id);
        const data = await apiFetch(`${API_BASE}/month/my`, {
          method: 'POST',
          body: { groupIds },
          showToast: false
        });
        if (data.success) setMonthRecords(data.months);
      } catch (err) {
        setMonthRecords([]);
      }
    };
    if (groups.length > 0) fetchMonthData();
  }, [groups]);

  useEffect(() => {
    const computeStatsAndGroups = async () => {
      const now = new Date();
      const currentMonthValue = now.getFullYear() * 12 + now.getMonth();
      const computedGroups = groups.map(group => {
        const start = new Date(group.startMonth);
        const startMonthValue = start.getFullYear() * 12 + start.getMonth();
        const monthsPassed = currentMonthValue - startMonthValue + 1;
        let groupStatus = 'upcoming';
        if (monthsPassed > 0 && monthsPassed <= group.tenure) {
          groupStatus = 'active';
        } else if (monthsPassed > group.tenure) {
          groupStatus = 'completed';
        }
        const currentMonth = Math.max(0, monthsPassed);
        const groupMonths = monthRecords.filter(m => m.groupId === group._id);
        let myPaymentStatus = 'upcoming';
        if (currentMonth > 0) {
          const pastMonths = groupMonths.filter(m => {
            const [monthName, year] = m.monthName.split(' ');
            const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
            const monthValue = parseInt(year) * 12 + monthIndex;
            return monthValue <= currentMonthValue;
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
          currentMonth,
          myPaymentStatus,
          groupStatus,
          nextPaymentDue: nextDue || null,
        };
      });
      setMergedGroups(computedGroups);
      const activeGroups = computedGroups.filter(g => g.groupStatus === 'active').length;
      const totalPaid = monthRecords
        .filter(m => m.status === 'paid')
        .reduce((sum, m) => sum + (m.amount || 0), 0);
      const upcomingPayments = monthRecords
        .filter(m => m.status === 'due' || m.status === 'pending').length;
      let pendingRequests = 0;
      try {
        const data = await apiFetch(`${API_BASE}/request/my`, { showToast: false });
        if (data.success) {
          pendingRequests = data.requests.filter(req => req.status === 'pending').length;
        }
      } catch (err) {}
      setStats({
        activeGroups,
        totalPaid,
        upcomingPayments,
        pendingRequests
      });
    };
    computeStatsAndGroups();
  }, [monthRecords]);

  useEffect(() => {
    // Fetch prebook requests for activity summary
    const fetchPrebookStats = async () => {
      try {
        const data = await apiFetch(`${API_BASE}/request/my`, { showToast: false });
        if (data.success && Array.isArray(data.requests)) {
          const prebooks = data.requests.filter(r => r.type === 'month_prebook');
          setPrebookStats({
            sent: prebooks.length,
            approved: prebooks.filter(r => r.status === 'approved').length,
          });
        }
      } catch (err) {
        setPrebookStats({ sent: 0, approved: 0 });
      }
    };
    fetchPrebookStats();
  }, []);

  useEffect(() => {
    // Compute last payment date
    const paidMonths = monthRecords.filter(m => m.status === 'paid');
    if (paidMonths.length > 0) {
      const latest = paidMonths.reduce((a, b) => new Date(a.paymentDate) > new Date(b.paymentDate) ? a : b);
      setLastPaymentDate(latest.paymentDate);
    } else {
      setLastPaymentDate(null);
    }
  }, [monthRecords]);

  // Compute netSavings
const computeNetSavings = () => {
  let totalPaid = 0;
  let totalPayout = 0;

  // Sum all paid months across all groups
  monthRecords.forEach((m) => {
    if (m.status === 'paid') {
      const group = groups.find(g => g._id === m.groupId);
      if (group) {
        totalPaid += group.shareAmount/group.tenure || 0;
      }
    }
  });

  // Check for payouts (approved prebook only)
  groups.forEach(group => {
    if (
      group.preBookedMonth &&
      group.preBookedMonth.status === 'approved' &&
      group.preBookedMonth.userId === currentUserId
    ) {
      totalPayout += (group.chitValue || 0) * 0.97;
    }
  });

  return totalPaid - totalPayout;
};

const netSavings = computeNetSavings();


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
            <span className="stat-label">Current Savings</span>
            <DollarSign className="stat-icon" />
          </div>
          <div className={`stat-value ${netSavings >= 0 ? 'green' : 'red'}`}>₹{netSavings.toLocaleString()}</div>
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
            className={`tab ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            className={`tab ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            My Activity Summary
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

          {activeTab === "activity" && (
            <div className="p-6 shadow-xl rounded-2xl bg-gradient-to-br from-white to-blue-50 max-w-3xl mx-auto mt-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Welcome back, {user.alias} 👋</h2>
              <p className="text-gray-700 mb-6">
                Here’s a quick summary of your financial journey with <strong>MS Chitfunds</strong>.<br/>
                Track your groups, payments, and progress all in one place.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Groups Joined" value={groups.length} icon={<Users className="w-7 h-7" />} />
                <StatCard title="Total Amount Paid" value={`₹${monthRecords.filter(m => m.status === 'paid').reduce((sum, m) => sum + (m.amount || 0), 0).toLocaleString()}`} icon={<DollarSign className="w-7 h-7" />} />
                <StatCard title="Pre-book Requests" value={`${prebookStats.sent} sent / ${prebookStats.approved} approved`} icon={<CalendarCheck className="w-7 h-7" />} />
                <StatCard title="Last Payment" value={lastPaymentDate ? new Date(lastPaymentDate).toLocaleDateString() : 'N/A'} icon={<Clock className="w-7 h-7" />} />
              </div>
              <div className="mt-6 text-sm text-gray-500">
                Last updated: {new Date().toLocaleString()}
              </div>
              <blockquote className="italic text-center text-gray-600 mt-8">
                "With every payment, you're building trust and stability. <strong>MS Chitfunds</strong> thanks you for being a valuable member."
              </blockquote>
              {/* Optionally, show a badge below */}
              <div className="flex justify-center mt-4">
                <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">Trusted Member since 2024</span>
              </div>
            </div>
          )}

          {activeTab === "notifications" && <RequestNotifications />}
        </div>
      </div>
    </div>
  );
};