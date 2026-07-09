import { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, Users } from 'lucide-react';
import { apiFetch } from '../lib/api';

const STATUS_CONFIG = {
  paid:     { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Paid' },
  pending:  { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Pending' },
  due:      { dot: 'bg-red-500',     text: 'text-red-700',     label: 'Due' },
  upcoming: { dot: 'bg-gray-300',    text: 'text-gray-500',    label: 'Upcoming' },
};

const MONTH_TILE_STATUS = {
  cleared:  { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'All paid' },
  partial:  { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Partial' },
  due:      { dot: 'bg-red-500',     text: 'text-red-700',     label: 'Due' },
  upcoming: { dot: 'bg-gray-300',    text: 'text-gray-500',    label: 'Upcoming' },
};

const displayName = (u) => {
  if (!u) return 'Unknown';
  if (u.name) return u.name;
  const parts = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return parts || u.email || 'Unknown';
};

export const GroupDetailsView = ({ group, onClose }) => {
  const [monthsData, setMonthsData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const monthNames = useMemo(() => {
    if (!group?.startMonth || !group?.tenure) return [];
    const start = new Date(group.startMonth);
    if (isNaN(start)) return [];
    return Array.from({ length: group.tenure }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      return {
        monthName: `${d.toLocaleString('en-US', { month: 'long' })} ${d.getFullYear()}`,
        date: d,
      };
    });
  }, [group]);

  useEffect(() => {
    if (!group || monthNames.length === 0) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`${API_BASE}/month/group/batch/${group._id}`, {
          method: 'POST',
          body: { monthNames: monthNames.map(m => m.monthName) },
          showToast: false,
        });
        setMonthsData(res?.success ? (res.monthsData || []) : []);
      } catch {
        setMonthsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [group, monthNames, API_BASE]);

  const memberCount = group.members?.length || 0;
  const now = new Date();

  const monthTiles = monthNames.map(({ monthName, date }) => {
    const details = monthsData.find(m => m.monthName === monthName)?.monthDetails || [];
    const paid = details.filter(d => d.status === 'paid').length;
    let tileStatus = 'upcoming';
    if (paid === memberCount && memberCount > 0) tileStatus = 'cleared';
    else if (paid > 0) tileStatus = 'partial';
    else if (date <= now) tileStatus = 'due';
    return { monthName, date, details, paid, total: memberCount, tileStatus };
  });

  const selected = selectedMonth
    ? monthTiles.find(t => t.monthName === selectedMonth) || null
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div
        className="bg-white w-full rounded-t-2xl sm:rounded-2xl border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.14)] sm:max-w-2xl sm:mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {selected && (
              <button
                onClick={() => setSelectedMonth(null)}
                className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors mr-1"
              >
                <ChevronLeft size={15} />
              </button>
            )}
            <h2 className="text-[15px] font-semibold text-gray-900 truncate">
              {selected
                ? `${selected.monthName} — Group ${group.groupNo}`
                : `Group ${group.groupNo} — Details`}
            </h2>
          </div>
          <button onClick={onClose} className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selected ? (
            /* Month detail view */
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl border border-gray-200/80 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Members</p>
                  <p className="text-[15px] font-bold text-gray-900 tabular-nums">{selected.total}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl border border-emerald-100 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 mb-1">Paid</p>
                  <p className="text-[15px] font-bold text-emerald-700 tabular-nums">{selected.paid}</p>
                </div>
                <div className="bg-amber-50 rounded-xl border border-amber-100 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1">Outstanding</p>
                  <p className="text-[15px] font-bold text-amber-700 tabular-nums">{Math.max(selected.total - selected.paid, 0)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/70">
                  <h3 className="text-[13px] font-semibold text-gray-700">Member Payments</h3>
                </div>
                {selected.details.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-gray-400">No records for this month yet.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {selected.details.map((d) => {
                      const st = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending;
                      return (
                        <li key={d._id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-[13px] truncate">{displayName(d.userId)}</p>
                            {d.userId?.email && <p className="text-[11px] text-gray-400 truncate">{d.userId.email}</p>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {d.monthDue > 0 && (
                              <span className="text-[12px] font-semibold text-gray-800 tabular-nums">₹{d.monthDue.toLocaleString()}</span>
                            )}
                            <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                              <span className={`w-[6px] h-[6px] rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            /* Group overview */
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Chit Value', value: `₹${group.chitValue?.toLocaleString()}` },
                  { label: 'Members',    value: memberCount },
                  { label: 'Tenure',     value: `${group.tenure} months` },
                  { label: 'Started',    value: new Date(group.startMonth).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                ].map(card => (
                  <div key={card.label} className="bg-gray-50 rounded-xl border border-gray-200/80 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{card.label}</p>
                    <p className="text-[15px] font-bold text-gray-900 tabular-nums">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-[13px] font-semibold text-gray-900">Monthly Progress</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">Tap a month to view member payment details</p>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-[13px] text-gray-400">Loading months…</div>
                ) : monthTiles.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-gray-400">No monthly data available.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
                    {monthTiles.map((tile) => {
                      const st = MONTH_TILE_STATUS[tile.tileStatus];
                      return (
                        <button
                          key={tile.monthName}
                          onClick={() => setSelectedMonth(tile.monthName)}
                          className="text-left p-3 rounded-xl border border-gray-200/80 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="text-[12px] font-semibold text-gray-800 truncate">
                              {tile.date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 tabular-nums">
                              <Users size={9} />
                              {tile.paid}/{tile.total}
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${st.text}`}>
                            <span className={`w-[5px] h-[5px] rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
