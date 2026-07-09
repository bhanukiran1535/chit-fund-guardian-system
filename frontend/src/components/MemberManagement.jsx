import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, UserCheck, Download, Edit2, Check, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useDebounce } from '../hooks/useDebounce';
import { LoadingSpinner } from './LoadingSpinner';

export const MemberManagement = () => {
  const navigate = useNavigate();
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [groups, setGroups] = useState([]);
  const [editingAliasUserId, setEditingAliasUserId] = useState(null);
  const [aliasDraft, setAliasDraft] = useState('');
  const [aliasSaving, setAliasSaving] = useState(false);
  const [aliasError, setAliasError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupsData, usersData] = await Promise.all([
        apiFetch(`${API_BASE}/group/allGroups`, { showToast: false }),
        apiFetch(`${API_BASE}/user/all`, { showToast: false }),
      ]);

      const userMap = new Map();

      if (groupsData?.success) {
        setGroups(groupsData.groups);
        groupsData.groups.forEach(group => {
          if (group.members?.length > 0) {
            group.members.forEach(member => {
              const userObj = member.userId || {};
              const userId = userObj._id || userObj.id;
              if (!userId) return;
              if (!userMap.has(userId)) {
                userMap.set(userId, { userId: userObj, totalGroups: 0, activeGroups: 0, completedGroups: 0, totalInvestment: 0, groups: [] });
              }
              const user = userMap.get(userId);
              user.totalGroups++;
              user.totalInvestment += member.shareAmount || group.chitValue;
              user.groups.push({ groupId: group._id, groupNo: group.groupNo, status: group.status, chitValue: group.chitValue, shareAmount: member.shareAmount, joinDate: member.joinDate, role: member.role });
              if (group.status === 'active') user.activeGroups++;
              if (group.status === 'completed') user.completedGroups++;
            });
          }
        });
      }

      // Include users that are not part of any group
      if (usersData?.success && Array.isArray(usersData.users)) {
        usersData.users.forEach(u => {
          const uid = u._id || u.id;
          if (!uid) return;
          if (!userMap.has(uid)) {
            userMap.set(uid, { userId: u, totalGroups: 0, activeGroups: 0, completedGroups: 0, totalInvestment: 0, groups: [] });
          }
        });
      }

      setUniqueUsers(Array.from(userMap.values()));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const filteredUsers = useMemo(() => {
    let filtered = [...uniqueUsers];
    if (debouncedSearchTerm) {
      filtered = filtered.filter(user =>
        user.userId.firstName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.userId.lastName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.userId.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.userId.alias?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'active') return user.activeGroups > 0;
        if (filterStatus === 'completed') return user.completedGroups > 0;
        return true;
      });
    }
    return filtered;
  }, [uniqueUsers, debouncedSearchTerm, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveAlias = async (userId) => {
    setAliasError('');
    if (!aliasDraft.trim()) { setAliasError('Alias cannot be blank.'); return; }
    setAliasSaving(true);
    try {
      await apiFetch(`${API_BASE}/user/admin/${userId}/alias`, { method: 'PUT', body: { alias: aliasDraft.trim() } });
      setEditingAliasUserId(null);
      setAliasDraft('');
      fetchData();
    } catch (error) {
      setAliasError(error.message || 'Unable to update alias.');
    } finally {
      setAliasSaving(false);
    }
  };

  const exportMemberData = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csvContent = [
      ['Name', 'Email', 'Alias', 'Total Groups', 'Active Groups', 'Total Investment'].map(esc).join(','),
      ...filteredUsers.map(user => [
        `${user.userId.firstName || ''} ${user.userId.lastName || ''}`.trim(),
        user.userId.email,
        user.userId.alias || '',
        user.totalGroups,
        user.activeGroups,
        user.totalInvestment,
      ].map(esc).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading members..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or alias…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[14px] sm:text-[13px] bg-white border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 sm:flex-none py-2.5 px-3 text-[13px] bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[44px] sm:min-h-0"
          >
            <option value="all">All Users</option>
            <option value="active">With Active Groups</option>
            <option value="completed">Has Completed Groups</option>
          </select>
          <button
            onClick={exportMemberData}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900">Member Management</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} across all groups
            </p>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Users className="mx-auto mb-3 opacity-30 text-gray-400" size={28} />
            <p className="text-[13px] text-gray-400">
              {uniqueUsers.length === 0
                ? 'No users yet.'
                : 'No users match your search or filter.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <div key={user.userId._id} className="px-4 py-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 text-[14px]">{user.userId.firstName} {user.userId.lastName}</p>
                      <p className="text-[12px] text-gray-400">{user.userId.email}</p>
                    </div>
                    <span className={`text-[12px] font-semibold ${user.activeGroups > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {user.activeGroups} active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-[12px]">
                    <div>
                      <p className="text-gray-400 mb-0.5">Alias</p>
                      <p className={`font-medium ${user.userId.alias ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                        {user.userId.alias || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Groups</p>
                      <p className="font-semibold text-gray-900">{user.totalGroups}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Investment</p>
                      <p className="font-semibold text-gray-900">₹{user.totalInvestment.toLocaleString()}</p>
                    </div>
                  </div>

                  {editingAliasUserId === user.userId._id && (
                    <div className="flex items-center gap-1.5">
                      <input
                        className="flex-1 px-2.5 py-2 text-[13px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={aliasDraft}
                        onChange={(e) => setAliasDraft(e.target.value)}
                        placeholder="Enter alias"
                      />
                      <button
                        type="button"
                        disabled={aliasSaving}
                        onClick={() => saveAlias(user.userId._id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingAliasUserId(null); setAliasDraft(''); setAliasError(''); }}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <X size={16} />
                      </button>
                      {aliasError && <span className="text-[11px] text-red-500">{aliasError}</span>}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {editingAliasUserId !== user.userId._id && !user.userId.isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAliasUserId(user.userId._id);
                          setAliasDraft(user.userId.alias || `${user.userId.firstName} ${user.userId.lastName}`);
                          setAliasError('');
                        }}
                        className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-md hover:bg-gray-50 transition-colors min-h-[44px]"
                      >
                        <Edit2 size={12} />
                        Alias
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/admin/user/${user.userId._id}/groups`)}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[13px] font-semibold rounded-md hover:bg-indigo-100 transition-colors min-h-[44px]"
                    >
                      <UserCheck size={12} />
                      Groups
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Alias</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Groups</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Investment</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.userId._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-800">{user.userId.firstName} {user.userId.lastName}</p>
                        <p className="text-[12px] text-gray-400">{user.userId.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {editingAliasUserId === user.userId._id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              className="px-2 py-1 text-[12px] border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-28"
                              value={aliasDraft}
                              onChange={(e) => setAliasDraft(e.target.value)}
                              placeholder="Enter alias"
                            />
                            <button
                              type="button"
                              disabled={aliasSaving}
                              onClick={() => saveAlias(user.userId._id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingAliasUserId(null); setAliasDraft(''); setAliasError(''); }}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                            >
                              <X size={14} />
                            </button>
                            {aliasError && <span className="text-[11px] text-red-500">{aliasError}</span>}
                          </div>
                        ) : (
                          <span className={user.userId.alias ? 'text-gray-700' : 'text-gray-300 italic'}>
                            {user.userId.alias || (user.userId.isAdmin ? '—' : 'No alias')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{user.totalGroups}</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${user.activeGroups > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {user.activeGroups}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        ₹{user.totalInvestment.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {editingAliasUserId !== user.userId._id && !user.userId.isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAliasUserId(user.userId._id);
                                setAliasDraft(user.userId.alias || `${user.userId.firstName} ${user.userId.lastName}`);
                                setAliasError('');
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Edit2 size={11} />
                              Alias
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/admin/user/${user.userId._id}/groups`)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold rounded-md hover:bg-indigo-100 transition-colors"
                          >
                            <UserCheck size={11} />
                            Groups
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
