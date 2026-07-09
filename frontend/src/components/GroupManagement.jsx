import { useEffect, useState, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Settings, Users, Megaphone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GroupDetailsView } from './GroupDetailsView';
import { apiFetch } from '../lib/api';

function calculateCurrentMonth(startDateISO, tenure) {
  const startDate = new Date(startDateISO);
  if (isNaN(startDate)) return 0;
  const now = new Date();
  const monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()) + 1;
  if (monthsPassed <= 0) return 0;
  if (tenure && monthsPassed > tenure) return tenure;
  return monthsPassed;
}

const STATUS_FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'Active' },
  { id: 'upcoming',  label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

const STATUS_STYLE = {
  active:    { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  upcoming:  { dot: 'bg-amber-400',   text: 'text-amber-700'   },
  completed: { dot: 'bg-gray-400',    text: 'text-gray-600'    },
};

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    aria-checked={checked}
    role="switch"
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
      checked ? 'bg-indigo-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${
      checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
    }`} />
  </button>
);

export const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedBanner, setExpandedBanner] = useState(null);
  const [bannerData, setBannerData] = useState({});
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [statusFilter, setStatusFilter] = useState('all');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`${API_BASE}/group/allGroups`, { showToast: false });
      const allGroups = response?.success ? response.groups : [];
      setGroups(allGroups);

      const initial = {};
      allGroups.forEach(g => {
        initial[g._id] = {
          enabled: g.bannerEnabled || false,
          tagline: g.bannerTagline || '',
          saving: false,
        };
      });
      setBannerData(initial);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const visibleGroups = useMemo(() => {
    if (statusFilter === 'all') return groups;
    return groups.filter(g => g.status === statusFilter);
  }, [groups, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: groups.length, active: 0, upcoming: 0, completed: 0 };
    groups.forEach(g => { if (counts[g.status] !== undefined) counts[g.status]++; });
    return counts;
  }, [groups]);

  const saveBanner = async (groupId, overrides = {}) => {
    const current = { ...bannerData[groupId], ...overrides };
    setBannerData(prev => ({ ...prev, [groupId]: { ...prev[groupId], ...overrides, saving: true } }));
    try {
      await apiFetch(`${API_BASE}/group/${groupId}/banner`, {
        method: 'PATCH',
        body: { bannerEnabled: current.enabled, bannerTagline: current.tagline },
        showToast: false,
      });
      toast.success(current.enabled ? 'Promotional banner enabled.' : 'Banner disabled.');
    } catch {
      toast.error('Failed to save banner settings.');
    }
    setBannerData(prev => ({ ...prev, [groupId]: { ...prev[groupId], saving: false } }));
  };

  const handleToggle = (groupId, enabled) => {
    setBannerData(prev => ({ ...prev, [groupId]: { ...prev[groupId], enabled } }));
    saveBanner(groupId, { enabled });
  };

  const handleTaglineSave = (groupId) => {
    saveBanner(groupId, {});
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-10 text-center text-[13px] text-gray-400">
        Loading groups…
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900">Group Management</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Manage all chit fund groups and their members</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100/70 border border-gray-200 rounded-lg p-0.5 overflow-x-auto scrollbar-none">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1.5 text-[12px] font-semibold rounded-md whitespace-nowrap transition-colors ${
                  statusFilter === f.id
                    ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {f.label}
                <span className={`ml-1 text-[10px] font-bold ${statusFilter === f.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {statusCounts[f.id] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {visibleGroups.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-gray-400">
            {groups.length === 0 ? 'No groups found.' : `No ${statusFilter} groups.`}
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {visibleGroups.map((group) => {
                const current = calculateCurrentMonth(group.startMonth, group.tenure);
                const pct = group.tenure ? Math.min(Math.round((current / group.tenure) * 100), 100) : 0;
                const st = STATUS_STYLE[group.status] || STATUS_STYLE.upcoming;
                return (
                  <div key={group._id} className="px-4 py-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-[14px]">Group {group.groupNo}</p>
                        <p className="text-[12px] text-gray-400">
                          Started {new Date(group.startMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                        <span className={`w-[6px] h-[6px] rounded-full ${st.dot}`} />
                        {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-[12px]">
                      <div>
                        <p className="text-gray-400 mb-0.5">Chit Value</p>
                        <p className="font-semibold text-gray-900">₹{group.chitValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Members</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                          <Users size={11} className="text-gray-400" />
                          {group.members?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Progress</p>
                        <p className="font-semibold text-gray-900">{current}/{group.tenure}</p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-md hover:bg-gray-50 transition-colors min-h-[44px]"
                      >
                        <Eye size={13} />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/admin/group/${group._id}/manage`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[13px] font-semibold rounded-md hover:bg-indigo-100 transition-colors min-h-[44px]"
                      >
                        <Settings size={13} />
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Group</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Chit Value</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Progress</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Members</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleGroups.map((group) => {
                    const current = calculateCurrentMonth(group.startMonth, group.tenure);
                    const pct = group.tenure ? Math.min(Math.round((current / group.tenure) * 100), 100) : 0;
                    const st = STATUS_STYLE[group.status] || STATUS_STYLE.upcoming;
                    const bd = bannerData[group._id];
                    const isExpanded = expandedBanner === group._id;

                    return (
                      <Fragment key={group._id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-gray-800">Group {group.groupNo}</p>
                            <p className="text-[12px] text-gray-400">
                              Started {new Date(group.startMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-gray-900">
                            ₹{group.chitValue.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[12px] text-gray-500 whitespace-nowrap">{current}/{group.tenure}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-gray-700">
                              <Users size={13} className="text-gray-400" />
                              {group.members?.length || 0}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                              <span className={`w-[6px] h-[6px] rounded-full ${st.dot}`} />
                              {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => setSelectedGroup(group)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/admin/group/${group._id}/manage`)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold rounded-md hover:bg-indigo-100 transition-colors"
                              >
                                <Settings size={12} />
                                Manage
                              </button>
                              {group.status === 'upcoming' && (
                                <button
                                  onClick={() => setExpandedBanner(isExpanded ? null : group._id)}
                                  className={`flex items-center gap-1 px-2.5 py-1 border text-[12px] font-semibold rounded-md transition-colors ${
                                    bd?.enabled
                                      ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                                      : isExpanded
                                        ? 'bg-gray-100 text-gray-700 border-gray-300'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  <Megaphone size={12} />
                                  Banner
                                  {bd?.enabled && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Banner settings expanded row */}
                        {isExpanded && group.status === 'upcoming' && (
                          <tr className="border-b border-gray-100">
                            <td colSpan={6} className="px-5 py-4 bg-indigo-50/40">
                              <div className="flex items-start gap-5">
                                <div className="flex items-center gap-3 shrink-0 pt-0.5">
                                  <Toggle
                                    checked={bd?.enabled || false}
                                    onChange={(val) => handleToggle(group._id, val)}
                                    disabled={bd?.saving}
                                  />
                                  <div>
                                    <p className="text-[13px] font-semibold text-gray-800">
                                      {bd?.enabled ? 'Banner live' : 'Banner disabled'}
                                    </p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                      {bd?.enabled
                                        ? 'Members can see this group in the promotional banner'
                                        : 'Toggle on to display a promotional banner to members'}
                                    </p>
                                  </div>
                                </div>

                                {bd?.enabled && (
                                  <div className="flex-1 flex items-center gap-2 min-w-0">
                                    <div className="flex-1 min-w-0">
                                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                                        Tagline (optional)
                                      </label>
                                      <input
                                        type="text"
                                        placeholder='e.g. "New ₹2L Chit Starting Next Month — Limited Slots!"'
                                        maxLength={120}
                                        value={bd?.tagline || ''}
                                        onChange={(e) =>
                                          setBannerData(prev => ({
                                            ...prev,
                                            [group._id]: { ...prev[group._id], tagline: e.target.value },
                                          }))
                                        }
                                        className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleTaglineSave(group._id)}
                                      disabled={bd?.saving}
                                      className="shrink-0 mt-5 px-3 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                                    >
                                      {bd?.saving ? 'Saving…' : 'Save'}
                                    </button>
                                  </div>
                                )}

                                {bd?.enabled && (
                                  <div className="shrink-0 pt-0.5">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
                                      <Sparkles size={11} />
                                      Preview
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                      {Math.max(0, group.tenure - (group.members?.length || 0))} slots remaining
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selectedGroup && (
        <GroupDetailsView group={selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}
    </>
  );
};
