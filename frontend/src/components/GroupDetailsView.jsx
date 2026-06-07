import { useState, useEffect } from 'react';
import { X, ChevronLeft, CheckCircle, Clock, XCircle, Users, Calendar } from 'lucide-react';
import { apiFetch } from '../lib/api';

const STATUS_CONFIG = {
  completed: { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Completed' },
  pending:   { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Pending'   },
  failed:    { dot: 'bg-red-500',     text: 'text-red-700',     label: 'Failed'    },
};

export const GroupDetailsView = ({ group, onClose }) => {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthMembers, setMonthMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => { if (group) fetchGroupMonths(); }, [group]);

  const fetchGroupMonths = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/month/group/${group._id}`, { showToast: false });
      if (data.success) setMonths(data.months || []);
    } catch { setMonths([]); }
  };

  const fetchMonthMembers = async (monthId) => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API_BASE}/payment/month/${monthId}`, { showToast: false });
      if (data.success) setMonthMembers(data.payments || []);
    } catch { setMonthMembers([]); }
    finally { setLoading(false); }
  };

  const handleMonthClick = (month) => { setSelectedMonth(month); fetchMonthMembers(month._id); };

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
        <div className="px-5 sm:px-6 pt-5 sm:pt-5 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth(null)}
                className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors mr-1 min-h-[44px] sm:min-h-0"
              >
                <ChevronLeft size={15} />
              </button>
            )}
            <h2 className="text-[15px] font-semibold text-gray-900">
              {selectedMonth
                ? `${new Date(selectedMonth.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} — Group ${group.groupNo}`
                : `Group ${group.groupNo} — Details`}
            </h2>
          </div>
          <button onClick={onClose} className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {selectedMonth ? (
            /* Month detail view */
            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl border border-gray-200/80 px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Winner</p>
                  <p className="text-[14px] font-semibold text-gray-800">{selectedMonth.winner || 'Not decided'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200/80 px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Auction Amount</p>
                  <p className="text-[14px] font-semibold text-gray-800">
                    {selectedMonth.auctionAmount ? `₹${selectedMonth.auctionAmount.toLocaleString()}` : '—'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/70">
                  <h3 className="text-[13px] font-semibold text-gray-700">Member Payments</h3>
                </div>
                {loading ? (
                  <div className="py-8 text-center text-[13px] text-gray-400">Loading members…</div>
                ) : (
                  <>
                    {/* Mobile card list */}
                    <div className="md:hidden divide-y divide-gray-100">
                      {monthMembers.map((payment) => {
                        const st = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                        return (
                          <div key={payment._id} className="px-4 py-3.5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-gray-800 text-[14px]">{payment.user?.name || payment.memberName}</p>
                              <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text} shrink-0`}>
                                <span className={`w-[6px] h-[6px] rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[12px] text-gray-500">
                              {payment.user?.email && <span>{payment.user.email}</span>}
                              {payment.amount && <span className="font-semibold text-gray-800">₹{payment.amount.toLocaleString()}</span>}
                              {payment.paymentDate && (
                                <span>{new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {/* Desktop table */}
                    <table className="hidden md:table w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/40">
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Member</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Paid On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthMembers.map((payment) => {
                          const st = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                          return (
                            <tr key={payment._id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-gray-800">{payment.user?.name || payment.memberName}</p>
                                {payment.user?.email && <p className="text-[11px] text-gray-400">{payment.user.email}</p>}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                                  <span className={`w-[6px] h-[6px] rounded-full ${st.dot}`} />
                                  {st.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">
                                {payment.amount ? `₹${payment.amount.toLocaleString()}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-[12px] text-gray-500">
                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not paid'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Group overview */
            <div className="p-5 sm:p-6 space-y-5">
              {/* Group info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Chit Value',  value: `₹${group.chitValue?.toLocaleString()}` },
                  { label: 'Members',     value: group.members?.length || 0 },
                  { label: 'Tenure',      value: `${group.tenure} months` },
                  { label: 'Started',     value: new Date(group.startMonth).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) },
                ].map(card => (
                  <div key={card.label} className="bg-gray-50 rounded-xl border border-gray-200/80 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{card.label}</p>
                    <p className="text-[15px] font-bold text-gray-900 tabular-nums">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Monthly progress */}
              <div className="rounded-xl border border-gray-200/80 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-[13px] font-semibold text-gray-900">Monthly Progress</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5">Tap a month to view member payment details</p>
                </div>

                {months.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-gray-400">No monthly data available.</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-4">
                    {months.map((month) => {
                      const st = STATUS_CONFIG[month.status] || STATUS_CONFIG.pending;
                      return (
                        <button
                          key={month._id}
                          onClick={() => handleMonthClick(month)}
                          className="text-left p-3 rounded-xl border border-gray-200/80 bg-white hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors min-h-[44px]"
                        >
                          <p className="text-[12px] font-semibold text-gray-800 truncate">
                            {new Date(month.month).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
                          </p>
                          <span className={`inline-flex items-center gap-1 mt-1 text-[11px] font-semibold ${st.text}`}>
                            <span className={`w-[5px] h-[5px] rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                          {month.winner && <p className="text-[10px] text-gray-400 mt-1 truncate">{month.winner}</p>}
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
