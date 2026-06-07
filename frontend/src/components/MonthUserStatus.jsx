import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  paid:    { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Paid',    row: 'border-l-emerald-400 bg-emerald-50/30' },
  pending: { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Pending', row: 'border-l-amber-400 bg-amber-50/30'    },
  due:     { dot: 'bg-red-500',     text: 'text-red-700',     label: 'Due',     row: 'border-l-red-400 bg-red-50/20'        },
};

export const MonthUserStatus = ({ group, monthData, onBack, adminMode = false }) => {
  const [memberStatuses, setMemberStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => { fetchMonthUserStatuses(); }, [group, monthData]);

  const fetchMonthUserStatuses = async () => {
    try {
      const response = await fetch(`${API_BASE}/month/group/${group._id}/${monthData.monthName}`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        const enrichedStatuses = group.members.map(member => {
          const monthDetail = data.monthDetails?.find(md => md.userId === member.userId._id);
          return {
            ...member,
            userInfo: member.userId,
            monthStatus: monthDetail?.status || 'due',
            paymentDate: monthDetail?.paymentDate,
            paymentMethod: monthDetail?.paymentMethod,
            monthDue: monthDetail?.monthDue || (member.shareAmount / group.tenure),
            prebookedThisMonth: monthDetail?.prebookedBy === member.userId._id
          };
        });
        setMemberStatuses(enrichedStatuses);
      }
    } catch (error) {
      console.error('Failed to fetch month user statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (userId) => {
    if (!adminMode) return;
    try {
      const response = await fetch(`${API_BASE}/payment/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          groupId: group._id,
          userId,
          monthName: monthData.monthName,
          paymentMethod: 'admin_marked',
          paymentDate: new Date().toISOString()
        }),
      });
      const data = await response.json();
      if (data.success) fetchMonthUserStatuses();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const paidCount = memberStatuses.filter(m => m.monthStatus === 'paid').length;
  const dueCount = memberStatuses.filter(m => m.monthStatus === 'due').length;
  const totalCollection = memberStatuses
    .filter(m => m.monthStatus === 'paid')
    .reduce((sum, m) => sum + m.monthDue, 0);

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors min-h-[44px]"
        >
          <ChevronLeft size={16} />
          Back to Months
        </button>
        <h2 className="text-[14px] sm:text-[15px] font-semibold text-gray-900 text-right">
          Group {group.groupNo} — {monthData.monthName}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Paid Members',    value: `${paidCount}/${memberStatuses.length}`, color: 'text-emerald-600' },
          { label: 'Total Collected', value: `₹${totalCollection.toLocaleString()}`,  color: 'text-indigo-600'  },
          { label: 'Due Payments',    value: dueCount,                                 color: dueCount > 0 ? 'text-red-600' : 'text-gray-900' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-3 sm:px-5 py-3 sm:py-4">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{card.label}</p>
            <p className={`text-[18px] sm:text-[22px] font-bold tabular-nums ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-[14px] font-semibold text-gray-900">Member Payment Status</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">{monthData.monthName} — {memberStatuses.length} members</p>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-[13px] text-gray-400">Loading member statuses…</div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-gray-100">
              {memberStatuses.map((member, index) => {
                const st = STATUS_CONFIG[member.monthStatus] || STATUS_CONFIG.due;
                const initials = `${member.userInfo.firstName?.[0] ?? ''}${member.userInfo.lastName?.[0] ?? ''}`.toUpperCase();
                return (
                  <div
                    key={index}
                    className={`px-4 py-4 border-l-[3px] ${member.prebookedThisMonth ? 'border-l-amber-400 bg-amber-50/20' : st.row}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-[11px] font-semibold shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-[14px]">{member.userInfo.firstName} {member.userInfo.lastName}</p>
                          {member.userInfo.alias && <p className="text-[11px] text-gray-400">{member.userInfo.alias}</p>}
                          {member.prebookedThisMonth && (
                            <p className="text-[11px] font-semibold text-amber-600">⭐ Month Winner</p>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text} shrink-0`}>
                        <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-3">
                        {member.role === 'foreman' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            👑 Foreman
                          </span>
                        )}
                        <span className="font-semibold text-gray-900">₹{Math.round(member.monthDue).toLocaleString()}</span>
                        {member.monthStatus === 'paid' && member.paymentDate && (
                          <span className="text-gray-400">
                            {new Date(member.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      {adminMode && member.monthStatus !== 'paid' && (
                        <button
                          onClick={() => markAsPaid(member.userInfo._id)}
                          className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white text-[12px] font-semibold rounded-md hover:bg-emerald-700 transition-colors min-h-[44px]"
                        >
                          <CheckCircle size={11} />
                          Mark Paid
                        </button>
                      )}
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
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount Due</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Payment Info</th>
                    {adminMode && <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {memberStatuses.map((member, index) => {
                    const st = STATUS_CONFIG[member.monthStatus] || STATUS_CONFIG.due;
                    const initials = `${member.userInfo.firstName?.[0] ?? ''}${member.userInfo.lastName?.[0] ?? ''}`.toUpperCase();
                    return (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition-colors border-l-[3px] ${member.prebookedThisMonth ? 'border-l-amber-400 bg-amber-50/20' : st.row}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-[10px] font-semibold shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{member.userInfo.firstName} {member.userInfo.lastName}</p>
                              {member.userInfo.alias && <p className="text-[11px] text-gray-400">{member.userInfo.alias}</p>}
                              {member.prebookedThisMonth && (
                                <p className="text-[11px] font-semibold text-amber-600">⭐ Month Winner</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {member.role === 'foreman' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              👑 Foreman
                            </span>
                          ) : (
                            <span className="text-[12px] text-gray-400">Member</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900 tabular-nums">
                          ₹{Math.round(member.monthDue).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                            <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-gray-500">
                          {member.monthStatus === 'paid' && member.paymentDate && (
                            <div className="space-y-0.5">
                              <p>{new Date(member.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              {member.paymentMethod && <p className="capitalize text-gray-400">{member.paymentMethod}</p>}
                            </div>
                          )}
                          {member.monthStatus !== 'paid' && <span className="text-gray-300">—</span>}
                        </td>
                        {adminMode && (
                          <td className="px-5 py-3.5">
                            {member.monthStatus !== 'paid' && (
                              <button
                                onClick={() => markAsPaid(member.userInfo._id)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[12px] font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle size={11} />
                                Mark Paid
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
