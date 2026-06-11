import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Users, Calendar, FileText } from 'lucide-react';
import { MonthUserStatus } from './MonthUserStatus';
import { apiFetch } from '../lib/api';
import { PaymentInstructionForm } from './PaymentInstructionForm';

const STATUS_CONFIG = {
  cleared:  { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'All Paid',        row: 'border-l-emerald-400 bg-emerald-50/30' },
  pending:  { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Partial',          row: 'border-l-amber-400 bg-amber-50/30'    },
  due:      { dot: 'bg-red-500',     text: 'text-red-700',     label: 'Payment Due',      row: 'border-l-red-400 bg-red-50/20'        },
  upcoming: { dot: 'bg-gray-300',    text: 'text-gray-500',    label: 'Upcoming',         row: 'border-l-transparent'                 },
};

export const GroupMonthManagement = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [instructionMonth, setInstructionMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => { if (groupId) fetchGroupData(); }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const groupData = await apiFetch(`${API_BASE}/group/${groupId}`, { showToast: false });
      if (groupData.success) {
        setGroup(groupData.group);
        await fetchGroupMonths(groupData.group);
      }
    } catch (error) {
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMonths = async (groupData) => {
    try {
      const startDate = new Date(groupData.startMonth);
      const currentDate = new Date();
      const generatedMonths = [];

      for (let i = 0; i < groupData.tenure; i++) {
        const monthDate = new Date(startDate);
        monthDate.setMonth(monthDate.getMonth() + i);
        const monthName = `${monthDate.toLocaleDateString('en-US', { month: 'long' })} ${monthDate.getFullYear()}`;
        let status = 'upcoming';
        if (monthDate <= currentDate) {
          const nextMonth = new Date(monthDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          status = nextMonth <= currentDate ? 'due' : 'pending';
        }
        generatedMonths.push({ monthName, monthDate, status, membersData: [] });
      }

      const monthNames = generatedMonths.map(m => m.monthName);
      try {
        const response = await fetch(`${API_BASE}/month/group/batch/${groupData._id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ monthNames })
        });
        const batchData = await response.json();
        if (batchData.success) {
          generatedMonths.forEach(month => {
            const monthData = batchData.monthsData.find(data => data.monthName === month.monthName);
            if (monthData) {
              month.membersData = monthData.monthDetails || [];
              const paidMembers = month.membersData.filter(m => m.status === 'paid').length;
              const totalMembers = groupData.members.length;
              if (paidMembers === totalMembers) month.status = 'cleared';
              else if (paidMembers > 0) month.status = 'pending';
              else if (month.monthDate <= currentDate) month.status = 'due';
            }
          });
        } else {
          await fetchMonthsIndividually(generatedMonths, groupData);
        }
      } catch (error) {
        await fetchMonthsIndividually(generatedMonths, groupData);
      }
      setMonths(generatedMonths);
    } catch (error) {
      setMonths([]);
    }
  };

  const fetchMonthsIndividually = async (generatedMonths, groupData) => {
    const currentDate = new Date();
    for (const month of generatedMonths) {
      try {
        const response = await fetch(`${API_BASE}/month/group/${groupData._id}/${month.monthName}`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          month.membersData = data.monthDetails || [];
          const paidMembers = month.membersData.filter(m => m.status === 'paid').length;
          const totalMembers = groupData.members.length;
          if (paidMembers === totalMembers) month.status = 'cleared';
          else if (paidMembers > 0) month.status = 'pending';
          else if (month.monthDate <= currentDate) month.status = 'due';
        }
      } catch (error) {
        console.error(`Failed to fetch data for ${month.monthName}:`, error);
      }
    }
  };

  const calculateMonthStats = (month) => {
    const totalMembers = group.members.length;
    const paidMembers = month.membersData.filter(m => m.status === 'paid').length;
    const dueMembers = totalMembers - paidMembers;
    const totalCollected = month.membersData
      .filter(m => m.status === 'paid')
      .reduce((sum, m) => sum + (m.monthDue || 0), 0);
    return { totalMembers, paidMembers, dueMembers, totalCollected };
  };

  if (selectedMonth) {
    return (
      <MonthUserStatus
        group={group}
        monthData={selectedMonth}
        onBack={() => setSelectedMonth(null)}
        adminMode={true}
      />
    );
  }

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

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f8fa] text-[14px] text-gray-400">
        Group not found.
      </div>
    );
  }

  const clearedCount = months.filter(m => m.status === 'cleared').length;
  const totalCollection = months.reduce((sum, m) => {
    const stats = calculateMonthStats(m);
    return sum + stats.totalCollected;
  }, 0);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f7f8fa' }}>
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-7 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/admin'); }}
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors min-h-[44px]"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <h1 className="text-[14px] font-semibold text-gray-900 hidden sm:block">
              Group {group.groupNo} — Monthly Management
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black select-none">MS</div>
            <span className="text-[14px] font-semibold text-gray-900 tracking-tight hidden sm:block">ChitFund</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-7 py-6 sm:py-8 space-y-6 sm:space-y-7 pb-20">
        {/* Page title on mobile */}
        <h1 className="text-[16px] font-semibold text-gray-900 sm:hidden">
          Group {group.groupNo} — Monthly Management
        </h1>

        {/* Group summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Chit Value', value: `₹${group.chitValue.toLocaleString()}` },
            { label: 'Members', value: group.members.length },
            { label: 'Tenure', value: `${group.tenure} months` },
            { label: 'Total Collected', value: `₹${totalCollection.toLocaleString()}` },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-4 sm:px-5 py-3 sm:py-4">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{card.label}</p>
              <p className="text-[18px] sm:text-[22px] font-bold tabular-nums text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Month table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900">Monthly Overview</h2>
              <p className="text-[12px] text-gray-400 mt-0.5">{clearedCount} of {months.length} months fully collected</p>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-gray-100">
            {months.map((month, index) => {
              const stats = calculateMonthStats(month);
              const pct = stats.totalMembers > 0 ? Math.round((stats.paidMembers / stats.totalMembers) * 100) : 0;
              const st = STATUS_CONFIG[month.status] || STATUS_CONFIG.upcoming;
              return (
                <div
                  key={index}
                  className={`px-4 py-4 border-l-[3px] ${st.row} cursor-pointer`}
                  onClick={() => setSelectedMonth(month)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-[14px]">{month.monthName}</p>
                      <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] mt-0.5 ${st.text}`}>
                        <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setInstructionMonth(month.monthName); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 text-[11px] font-semibold rounded-md"
                      >
                        <FileText size={11} /> Instructions
                      </button>
                      <button className="px-3 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold rounded-md min-h-[44px]">
                        Details →
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-gray-500">
                    <span>{stats.paidMembers}/{stats.totalMembers} paid</span>
                    <span className="font-semibold text-gray-800">₹{stats.totalCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop custom grid layout */}
          <div className="hidden md:block">
            <div
              className="grid px-5 py-2.5 bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
              style={{ gridTemplateColumns: '2.5rem 1fr 7rem 6rem 6rem 8rem' }}
            >
              <span>#</span>
              <span>Month</span>
              <span>Status</span>
              <span>Paid</span>
              <span>Collected</span>
              <span className="text-right">Action</span>
            </div>

            {months.map((month, index) => {
              const stats = calculateMonthStats(month);
              const pct = stats.totalMembers > 0 ? Math.round((stats.paidMembers / stats.totalMembers) * 100) : 0;
              const st = STATUS_CONFIG[month.status] || STATUS_CONFIG.upcoming;

              return (
                <div
                  key={index}
                  className={`grid px-5 py-3.5 border-b border-gray-100 last:border-b-0 items-center text-[13px] border-l-[3px] hover:bg-gray-50/40 transition-colors cursor-pointer ${st.row}`}
                  style={{ gridTemplateColumns: '2.5rem 1fr 7rem 6rem 6rem 8rem' }}
                  onClick={() => setSelectedMonth(month)}
                >
                  <span className="text-[12px] text-gray-400 tabular-nums">{index + 1}</span>

                  <div>
                    <p className="font-semibold text-gray-800">{month.monthName}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-gray-400">{pct}%</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                    <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${st.dot}`} />
                    {st.label}
                  </span>

                  <span className="text-gray-700 tabular-nums">{stats.paidMembers}/{stats.totalMembers}</span>

                  <span className="font-semibold text-gray-900 tabular-nums">
                    ₹{stats.totalCollected.toLocaleString()}
                  </span>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setInstructionMonth(month.monthName); }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={11} /> Instructions
                    </button>
                    <button className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold rounded-md hover:bg-indigo-100 transition-colors">
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {instructionMonth && (
        <PaymentInstructionForm
          groupId={groupId}
          monthName={instructionMonth}
          onClose={() => setInstructionMonth(null)}
          onSaved={() => setInstructionMonth(null)}
        />
      )}
    </div>
  );
};
