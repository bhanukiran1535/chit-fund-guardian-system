import { useState, useEffect } from 'react';
import { Users, DollarSign, Calendar, AlertCircle, Plus } from 'lucide-react';
import { AdminRequests } from './AdminRequests';
import { GroupManagement } from './GroupManagement';
import { MemberManagement } from './MemberManagement';
import { AppLayout } from './AppLayout';
import { CreateGroupForm } from './CreateGroupForm';
import { AddMemberForm } from './AddMemberForm';
import { apiFetch } from '../lib/api';

const StatCard = ({ label, value, sub, color = 'default' }) => {
  const valueColor = {
    default: 'text-gray-900',
    indigo: 'text-indigo-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    emerald: 'text-emerald-600',
  }[color];
  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-4 sm:px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <p className={`text-[22px] sm:text-[26px] font-bold tabular-nums leading-none ${valueColor}`}>{value}</p>
      {sub && <p className="text-[12px] text-gray-400 mt-2">{sub}</p>}
    </div>
  );
};

const TABS = [
  { id: 'requests', label: 'Pending Requests' },
  { id: 'groups', label: 'Groups' },
  { id: 'members', label: 'Members' },
];

export const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberForm, setAddMemberForm] = useState(false);
  const [stats, setStats] = useState({ totalGroups: 0, totalMembers: 0, pendingRequests: 0, monthlyCollection: 0 });
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const [groupsResponse, requestsResponse, paymentsResponse] = await Promise.allSettled([
          apiFetch(`${API_BASE}/group/allGroups`, { showToast: false }),
          apiFetch(`${API_BASE}/request/pending`, { showToast: false }),
          apiFetch(`${API_BASE}/payment/monthly-collection`, { showToast: false })
        ]);
        let totalGroups = 0, totalMembers = 0, pendingRequests = 0, monthlyCollection = 0;
        if (groupsResponse.status === 'fulfilled' && groupsResponse.value?.success) {
          const groups = groupsResponse.value.groups || [];
          totalGroups = groups.length;
          totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
        }
        if (requestsResponse.status === 'fulfilled' && requestsResponse.value?.success) {
          pendingRequests = (requestsResponse.value.requests || []).length;
        }
        if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value?.success) {
          monthlyCollection = paymentsResponse.value.totalCollection || 0;
        }
        setStats({ totalGroups, totalMembers, pendingRequests, monthlyCollection });
      } catch (error) {
        setStats({ totalGroups: 0, totalMembers: 0, pendingRequests: 0, monthlyCollection: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [API_BASE]);

  const NAV_TO_TAB = { dashboard: 'requests', groups: 'groups', members: 'members' };
  const TAB_TO_NAV = { requests: 'dashboard', groups: 'groups', members: 'members' };

  const handleNavClick = (navId) => {
    const tabId = NAV_TO_TAB[navId];
    if (tabId) setActiveTab(tabId);
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Admin Overview" activeView="dashboard" onNavClick={handleNavClick}>
        <div className="flex items-center justify-center h-64">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Admin Overview" activeView={TAB_TO_NAV[activeTab]} onNavClick={handleNavClick}>
      <div className="max-w-6xl mx-auto px-4 sm:px-7 py-6 sm:py-8 space-y-6 sm:space-y-7 pb-20">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-semibold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Manage groups, members and approve requests
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 sm:py-2 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px] sm:min-h-0"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Group</span>
              <span className="sm:hidden">Group</span>
            </button>
            <button
              onClick={() => setAddMemberForm(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 sm:py-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] sm:min-h-0"
            >
              <Users size={14} />
              <span className="hidden sm:inline">Add Member</span>
              <span className="sm:hidden">Member</span>
            </button>
          </div>
        </div>

        {showCreateForm && <CreateGroupForm onClose={() => setShowCreateForm(false)} />}
        {showAddMemberForm && <AddMemberForm onClose={() => setAddMemberForm(false)} />}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total Groups" value={stats.totalGroups} sub="Active & upcoming" color="indigo" />
          <StatCard label="Total Members" value={stats.totalMembers} sub="Across all groups" color="emerald" />
          <StatCard
            label="Pending Requests"
            value={stats.pendingRequests}
            sub="Awaiting review"
            color={stats.pendingRequests > 0 ? 'red' : 'default'}
          />
          <StatCard
            label="Monthly Collection"
            value={`₹${stats.monthlyCollection.toLocaleString()}`}
            sub="This month"
            color="amber"
          />
        </div>

        <div>
          <div className="flex items-center border-b border-gray-200 overflow-x-auto scrollbar-none">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3 sm:px-4 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                  activeTab === tab.id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.id === 'requests' && stats.pendingRequests > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
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
            {activeTab === 'requests' && <AdminRequests />}
            {activeTab === 'groups' && <GroupManagement />}
            {activeTab === 'members' && <MemberManagement />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
