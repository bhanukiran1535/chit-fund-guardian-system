import { useEffect, useState } from 'react';
import { Users, TrendingUp, IndianRupee, CalendarCheck } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { RequestNotifications } from './RequestNotifications';
import { ChitValueBanner } from './ChitValueBanner';
import { AppLayout } from './AppLayout';
import { apiFetch } from '../lib/api';

const StatCard = ({ label, value, sub, color = 'default' }) => {
  const valueColor = { default: 'text-gray-900', indigo: 'text-indigo-600', amber: 'text-amber-600', red: 'text-red-600' }[color];
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <p className={`text-[26px] font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
      {sub && <p className="text-[12px] text-gray-400 mt-2">{sub}</p>}
    </div>
  );
};

const TABS = [
  { id: 'groups',        label: 'My Groups'      },
  { id: 'notifications', label: 'Notifications'  },
  { id: 'activity',      label: 'Activity'        },
];

const TIMELINE_ICONS = {
  paid:     { icon: <IndianRupee size={12} />,    bg: 'bg-emerald-500', ring: 'ring-emerald-100' },
  prebook:  { icon: <CalendarCheck size={12} />,  bg: 'bg-purple-500',  ring: 'ring-purple-100'  },
  joined:   { icon: <Users size={12} />,          bg: 'bg-indigo-500',  ring: 'ring-indigo-100'  },
  upcoming: { icon: <TrendingUp size={12} />,     bg: 'bg-gray-400',    ring: 'ring-gray-100'    },
};

const relativeDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [stats, setStats] = useState({ activeGroups: 0, totalPaid: 0, upcomingPayments: 0, pendingRequests: 0 });
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [groups, setGroups] = useState([]);
  const [monthRecords, setMonthRecords] = useState([]);
  const [mergedGroups, setMergedGroups] = useState([]);
  const [prebookStats, setPrebookStats] = useState({ sent: 0, approved: 0 });
  const [prebookRequests, setPrebookRequests] = useState([]);
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
      } catch { setGroups([]); }
    };
    fetchMyGroups();
  }, []);

  useEffect(() => {
    const fetchMonthData = async () => {
      try {
        const groupIds = groups.map(g => g._id);
        const data = await apiFetch(`${API_BASE}/month/my`, { method: 'POST', body: { groupIds }, showToast: false });
        if (data.success) setMonthRecords(data.months);
      } catch { setMonthRecords([]); }
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
        if (monthsPassed > 0 && monthsPassed <= group.tenure) groupStatus = 'active';
        else if (monthsPassed > group.tenure) groupStatus = 'completed';
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
          if (pastMonths.some(m => m.status === 'due')) myPaymentStatus = 'due';
          else if (pastMonths.some(m => m.status === 'pending')) myPaymentStatus = 'pending';
          else myPaymentStatus = 'paid';
        }
        const nextDue = groupMonths.find(m => m.status === 'due' || m.status === 'pending')?.monthName;
        return { ...group, currentMonth, myPaymentStatus, groupStatus, nextPaymentDue: nextDue || null };
      });
      setMergedGroups(computedGroups);
      const activeGroups = computedGroups.filter(g => g.groupStatus === 'active').length;
      const totalPaid = monthRecords.filter(m => m.status === 'paid').reduce((sum, m) => sum + (m.amount || 0), 0);
      const upcomingPayments = monthRecords.filter(m => m.status === 'due' || m.status === 'pending').length;
      let pendingRequests = 0;
      try {
        const data = await apiFetch(`${API_BASE}/request/my`, { showToast: false });
        if (data.success) pendingRequests = data.requests.filter(req => req.status === 'pending').length;
      } catch {}
      setStats({ activeGroups, totalPaid, upcomingPayments, pendingRequests });
    };
    computeStatsAndGroups();
  }, [monthRecords]);

  useEffect(() => {
    const fetchPrebookStats = async () => {
      try {
        const data = await apiFetch(`${API_BASE}/request/my`, { showToast: false });
        if (data.success && Array.isArray(data.requests)) {
          const prebooks = data.requests.filter(r => r.type === 'month_prebook');
          setPrebookStats({ sent: prebooks.length, approved: prebooks.filter(r => r.status === 'approved').length });
          setPrebookRequests(prebooks);
        }
      } catch { setPrebookStats({ sent: 0, approved: 0 }); setPrebookRequests([]); }
    };
    fetchPrebookStats();
  }, []);

  useEffect(() => {
    const paidMonths = monthRecords.filter(m => m.status === 'paid');
    if (paidMonths.length > 0) {
      const latest = paidMonths.reduce((a, b) => new Date(a.paymentDate) > new Date(b.paymentDate) ? a : b);
      setLastPaymentDate(latest.paymentDate);
    } else {
      setLastPaymentDate(null);
    }
  }, [monthRecords]);

  const computeNetSavings = () => {
    let totalPaid = 0;
    monthRecords.forEach((m) => {
      if (m.status === 'paid') {
        const group = groups.find(g => g._id === m.groupId);
        if (group) totalPaid += group.shareAmount / group.tenure || 0;
      }
    });
    return totalPaid;
  };

  const netSavings = computeNetSavings();
  const totalAmountPaid = monthRecords.filter(m => m.status === 'paid').reduce((sum, m) => sum + (m.amount || 0), 0);
  const firstName = user?.firstName || '';

  /* ── Timeline events ─────────────────────────────────────── */
  const timelineEvents = [];

  // Paid events
  monthRecords.forEach(m => {
    if (m.status === 'paid') {
      const group = groups.find(g => g._id === m.groupId);
      timelineEvents.push({
        type: 'paid',
        label: `Paid ₹${Math.round(m.amount || (group?.shareAmount / group?.tenure) || 0).toLocaleString()} — Group ${group?.groupNo || ''}`,
        sub: m.monthName,
        date: m.paymentDate || m.updatedAt,
      });
    }
  });

  // Prebooked events
  prebookRequests.forEach(r => {
    timelineEvents.push({
      type: 'prebook',
      label: `Payout prebook requested${r.monthName ? ` for ${r.monthName}` : ''}`,
      sub: r.status === 'approved' ? 'Approved by admin' : r.status === 'rejected' ? 'Rejected' : 'Pending admin review',
      date: r.timestamp || r.createdAt,
    });
  });

  // Joined events
  groups.forEach(g => {
    timelineEvents.push({
      type: 'joined',
      label: `Joined Group ${g.groupNo}`,
      sub: `₹${(g.shareAmount || 0).toLocaleString()} chit · ${g.tenure} months`,
      date: g.startMonth,
    });
  });

  timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  const displayEvents = timelineEvents.slice(0, 25);

  const handleNavClick = (id) => {
    if (TABS.find(t => t.id === id)) setActiveTab(id);
  };

  return (
    <AppLayout
      pageTitle="Overview"
      activeView={activeTab}
      onNavClick={handleNavClick}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-7 py-6 sm:py-8 space-y-6 sm:space-y-7 pb-24 md:pb-20">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-gray-900 tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Your financial snapshot — {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <ChitValueBanner />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Groups" value={stats.activeGroups} sub={`${groups.length} total enrolled`} />
          <StatCard
            label="Current Savings"
            value={`₹${netSavings.toLocaleString()}`}
            sub="Net across all groups"
            color={netSavings >= 0 ? 'indigo' : 'red'}
          />
          <StatCard
            label="Upcoming Payments"
            value={stats.upcomingPayments}
            sub="Due or pending"
            color={stats.upcomingPayments > 0 ? 'amber' : 'default'}
          />
          <StatCard
            label="Pending Requests"
            value={stats.pendingRequests}
            sub="Awaiting admin review"
            color={stats.pendingRequests > 0 ? 'red' : 'default'}
          />
        </div>

        {/* Tabs */}
        <div>
          <div className="flex items-center border-b border-gray-200">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                  activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.id === 'notifications' && stats.pendingRequests > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                    {stats.pendingRequests}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600 rounded-t" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {/* ── Groups tab ───────────────────────────────── */}
            {activeTab === 'groups' && (
              mergedGroups.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users className="mx-auto mb-3 opacity-40" size={32} />
                  <p className="text-[14px]">No groups yet. Request to join a group from the banner above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mergedGroups.map((group) => (
                    <GroupCard key={group._id} group={group} />
                  ))}
                </div>
              )
            )}

            {/* ── Notifications tab ────────────────────────── */}
            {activeTab === 'notifications' && <RequestNotifications />}

            {/* ── Activity tab ─────────────────────────────── */}
            {activeTab === 'activity' && (
              <div className="space-y-5">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200/80 px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Total Paid</p>
                    <p className="text-[24px] font-bold text-gray-900 tabular-nums">₹{totalAmountPaid.toLocaleString()}</p>
                    <p className="text-[12px] text-gray-500 mt-1">Across all groups</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200/80 px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Prebook Requests</p>
                    <p className="text-[24px] font-bold text-gray-900 tabular-nums">{prebookStats.sent}</p>
                    <p className="text-[12px] text-gray-500 mt-1">
                      {prebookStats.approved} approved · {prebookStats.sent - prebookStats.approved} pending
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200/80 px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Last Payment</p>
                    <p className="text-[24px] font-bold text-gray-900 tabular-nums">
                      {lastPaymentDate
                        ? new Date(lastPaymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : '—'}
                    </p>
                    <p className="text-[12px] text-gray-500 mt-1">
                      {lastPaymentDate
                        ? new Date(lastPaymentDate).toLocaleDateString('en-IN', { year: 'numeric' })
                        : 'No payments yet'}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100">
                    <h3 className="text-[14px] font-semibold text-gray-900">Payment Timeline</h3>
                    <p className="text-[12px] text-gray-400 mt-0.5">Your recent payment activity across all groups</p>
                  </div>

                  {displayEvents.length === 0 ? (
                    <div className="px-5 py-10 text-center text-[13px] text-gray-400">
                      No payment activity yet. Your transactions will appear here.
                    </div>
                  ) : (
                    <div className="px-5 py-4">
                      <div className="relative">
                        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
                        <div className="space-y-4">
                          {displayEvents.map((event, i) => {
                            const tl = TIMELINE_ICONS[event.type] || TIMELINE_ICONS.upcoming;
                            return (
                              <div key={i} className="flex gap-4 relative">
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full ${tl.bg} ring-4 ${tl.ring} flex items-center justify-center text-white z-10`}>
                                  {tl.icon}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5 pb-4 border-b border-gray-100 last:border-b-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-[13px] font-semibold text-gray-800 leading-snug">{event.label}</p>
                                    <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                                      {relativeDate(event.date)}
                                    </span>
                                  </div>
                                  {event.sub && (
                                    <p className="text-[12px] text-gray-400 mt-0.5">{event.sub}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
