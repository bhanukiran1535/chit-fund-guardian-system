import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, Users, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../lib/api';

const STATUS_STYLE = {
  active:    { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  upcoming:  { dot: 'bg-amber-400',   text: 'text-amber-700'   },
  completed: { dot: 'bg-gray-400',    text: 'text-gray-600'    },
};

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
        state: { group: selectedGroup, adminMode: true, userId: user._id, userFirstName: user.firstName }
      });
    }
  }, [selectedGroup, user, navigate]);

  useEffect(() => { if (userId) fetchUserData(); }, [userId]);

  const fetchUserData = async () => {
    try {
      const userData = await apiFetch(`${API_BASE}/user/${userId}`, { showToast: false });
      if (userData?.success) {
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
      const data = await apiFetch(`${API_BASE}/group/allGroups`, { showToast: false });
      if (data?.success) {
        const filteredGroups = data.groups.filter(group =>
          group.members.some(member => member.userId?._id === userData._id)
        );
        const enrichedGroups = filteredGroups.map(group => {
          const userMember = group.members.find(member => member.userId?._id === userData._id);
          return {
            ...group,
            userShareAmount: userMember?.shareAmount || group.chitValue,
            userPreBookedMonth: userMember?.preBookedMonth,
          };
        });
        setUserGroups(enrichedGroups);
      }
    } catch (error) {
      console.error('Failed to fetch user groups:', error);
    }
  };

  const calculateUserStats = () => {
    const totalInvestment = userGroups.reduce((sum, g) => sum + (g.userShareAmount || 0), 0);
    const activeGroups = userGroups.filter(g => g.status === 'active').length;
    const completedGroups = userGroups.filter(g => g.status === 'completed').length;
    const unclaimedGroups = userGroups.filter(g => g.status === 'completed' && !g.userPreBookedMonth).length;
    return { totalInvestment, activeGroups, completedGroups, unclaimedGroups };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f8fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black">MS</div>
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f8fa] text-[14px] text-gray-400">
        User not found.
      </div>
    );
  }

  const stats = calculateUserStats();
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f7f8fa' }}>
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-7 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) navigate(-1);
                else navigate('/admin/members');
              }}
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <span className="text-gray-200">|</span>
            <h1 className="text-[14px] font-semibold text-gray-900">
              {user.firstName} {user.lastName} — Groups
            </h1>
          </div>
          <div className="text-[12px] text-gray-400 hidden sm:block">
            Admin view
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-7 py-8 space-y-7 pb-20">
        {/* Unclaimed payouts banner */}
        {stats.unclaimedGroups > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">
                {stats.unclaimedGroups} unclaimed payout{stats.unclaimedGroups > 1 ? 's' : ''}
              </p>
              <p className="text-[12px] text-amber-700">
                This member has completed group(s) with no prebooked payout month — follow up to resolve.
              </p>
            </div>
          </div>
        )}

        {/* User card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-[16px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[16px] font-semibold text-gray-900">{user.firstName} {user.lastName}</h2>
              <p className="text-[13px] text-gray-400">{user.email}</p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Total Groups', value: userGroups.length },
                { label: 'Active',       value: stats.activeGroups },
                { label: 'Investment',   value: `₹${stats.totalInvestment.toLocaleString()}` },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-[18px] font-bold text-gray-900 tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Groups table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-[14px] font-semibold text-gray-900">Group Participation</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{userGroups.length} group{userGroups.length !== 1 ? 's' : ''} enrolled</p>
          </div>

          {userGroups.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Users className="mx-auto mb-3 opacity-30 text-gray-400" size={28} />
              <p className="text-[13px] text-gray-400">This user has not joined any groups yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Group</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Chit Value</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">User Share</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Payout Month</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userGroups.map((group) => {
                    const st = STATUS_STYLE[group.status] || STATUS_STYLE.upcoming;
                    const isCompleted = group.status === 'completed';
                    const isUnclaimed = isCompleted && !group.userPreBookedMonth;
                    return (
                      <tr
                        key={group._id}
                        className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition-colors ${isCompleted ? 'opacity-70' : ''} ${isUnclaimed ? 'border-l-2 border-l-amber-400' : ''}`}
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-800">Group {group.groupNo}</p>
                          <p className="text-[12px] text-gray-400">
                            {group.userJoinDate
                              ? `Joined ${new Date(group.userJoinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
                              : `${group.tenure} months`}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">
                          ₹{group.chitValue.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">
                          ₹{group.userShareAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          {isUnclaimed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <AlertTriangle size={9} />
                              Unclaimed
                            </span>
                          ) : (
                            <span className="text-gray-600">{group.userPreBookedMonth || <span className="text-gray-300">—</span>}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                            <span className={`w-[6px] h-[6px] rounded-full ${st.dot}`} />
                            {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {group.userRole === 'foreman' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              👑 Foreman
                            </span>
                          ) : (
                            <span className="text-[12px] text-gray-400 capitalize">{group.userRole}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setSelectedGroup(group)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold rounded-md hover:bg-indigo-100 transition-colors"
                          >
                            <Eye size={12} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
