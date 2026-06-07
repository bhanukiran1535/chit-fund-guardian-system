import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Eye, CreditCard, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { apiFetch } from '../lib/api';
import { useForm } from 'react-hook-form';
import { toast } from './ui/sonner';

const STATUS_CONFIG = {
  paid:     { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Paid'     },
  pending:  { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Pending'  },
  due:      { dot: 'bg-red-500',     text: 'text-red-700',     label: 'Due'      },
  upcoming: { dot: 'bg-gray-300',    text: 'text-gray-500',    label: 'Upcoming' },
};

export const GroupMonthDetails = ({ adminMode: propAdminMode, userId: propUserId } = {}) => {
  const location = useLocation();
  const routeState = location.state || {};
  const userId = propUserId || routeState.userId;
  const firstName = routeState.user?.firstName;
  const adminMode = propAdminMode ?? routeState.adminMode ?? false;

  const [months, setMonths] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [shareAmount, setShareAmount] = useState(0);
  const [hasPreBookedMonth, setHasPreBookedMonth] = useState('');
  const [prebookStatuses, setPrebookStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const { groupId } = useParams();
  const API = import.meta.env.VITE_API_BASE_URL;
  const nav = useNavigate();
  const [cashRequests, setCashRequests] = useState({});
  const [leaveRequestStatus, setLeaveRequestStatus] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (!groupId) return;
        const requestBody = { groupIds: [groupId] };
        if (adminMode && userId) requestBody.userId = userId;
        const mData = await apiFetch(`${API}/month/my`, { method: 'POST', body: requestBody, showToast: false });
        const gData = await apiFetch(`${API}/group/${groupId}${adminMode && userId ? `?userId=${userId}` : ''}`, { showToast: false });
        if (mData.success) {
          const sorted = mData.months.sort((a, b) => {
            const [monthA, yearA] = a.monthName.split(' ');
            const [monthB, yearB] = b.monthName.split(' ');
            return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
          });
          setMonths(sorted);
        }
        if (gData.success) {
          setGroupInfo(gData.group);
          const member = gData.group.members.find(m => m.userId === gData.userId);
          setShareAmount(member?.shareAmount || 0);
          setHasPreBookedMonth(member?.preBookedMonth || '');
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [API, groupId]);

  useEffect(() => {
    async function fetchPrebookRequests() {
      try {
        const res = await fetch(`${API}/request/my`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          const statuses = {};
          const cashReqs = {};
          let leaveStatus = null;
          data.requests.forEach(r => {
            if (r.type === 'month_prebook' && r.groupId._id === groupId) {
              statuses[r.monthName] = r.status;
              if (r.status === 'approved') setHasPreBookedMonth(r.monthName);
            }
            if (r.type === 'confirm_cash_payment' && r.groupId._id === groupId) {
              cashReqs[r.monthName] = r.status;
            }
            if (r.type === 'leave_group' && r.groupId._id === groupId) {
              leaveStatus = r.status;
            }
          });
          setPrebookStatuses(statuses);
          setCashRequests(cashReqs);
          if (groupInfo && groupInfo.members && groupInfo.members.some(m => m.userId === data.userId)) {
            setLeaveRequestStatus(null);
          } else {
            setLeaveRequestStatus(leaveStatus);
          }
        }
      } catch (err) {
        console.error('Failed to fetch prebook/cash/leave requests', err);
      }
    }
    fetchPrebookRequests();
  }, [API, groupId, groupInfo]);

  const handlePreBook = async (monthName) => {
    setLoading(true);
    setPrebookStatuses(prev => ({ ...prev, [monthName]: 'pending' }));
    try {
      await apiFetch(`${API}/request/prebook`, { method: 'POST', body: { groupId, monthName, shareAmount } });
      setPrebookStatuses(prev => ({ ...prev, [monthName]: 'pending' }));
    } catch (error) {
      setPrebookStatuses(prev => ({ ...prev, [monthName]: 'failed' }));
    }
    setLoading(false);
  };

  const calculateAmount = (monthName, base, prebookMonth) => {
    const allMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (!prebookMonth) return base;
    const [preMonth, preYear] = prebookMonth.split(' ');
    const [curMonth, curYear] = monthName.split(' ');
    const preIndex = allMonths.indexOf(preMonth) + parseInt(preYear) * 12;
    const curIndex = allMonths.indexOf(curMonth) + parseInt(curYear) * 12;
    return curIndex >= preIndex ? base + base * 0.2 : base;
  };

  const handlePayNow = (month) => {
    if (cashRequests[month.monthName] === 'pending') {
      toast.error('A cash payment request for this month is already pending.');
      return;
    }
    setSelectedMonth(month);
    setShowPaymentModal(true);
  };

  const submitPayment = async (data) => {
    setLoading(true);
    try {
      if (data.paymentMethod === 'cash' && !adminMode) {
        if (cashRequests[selectedMonth.monthName] === 'pending') {
          toast.error('A cash payment request for this month is already pending.');
          setShowPaymentModal(false);
          setLoading(false);
          return;
        }
        await apiFetch(`${API}/request/payment`, {
          method: 'POST',
          body: { groupId, monthName: selectedMonth.monthName, amount: calculateAmount(selectedMonth.monthName, split, hasPreBookedMonth) },
        });
        setShowPaymentModal(false);
        toast.success('Cash payment confirmation request sent!');
        setCashRequests(prev => ({ ...prev, [selectedMonth.monthName]: 'pending' }));
      } else {
        await apiFetch(`${API}/payment/make`, {
          method: 'POST',
          body: { groupId, monthName: selectedMonth.monthName, paymentMethod: data.paymentMethod, paymentDate: new Date().toISOString() },
        });
        setShowPaymentModal(false);
        location.reload();
      }
    } catch (error) {
      toast.error('Payment failed.');
    }
    setLoading(false);
  };

  const handleCashConfirmRequest = async (month) => {
    if (cashRequests[month.monthName] === 'pending') {
      toast.error('A cash payment request for this month is already pending.');
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`${API}/request/payment`, {
        method: 'POST',
        body: { groupId, monthName: month.monthName, amount: calculateAmount(month.monthName, split, hasPreBookedMonth) },
      });
      toast.success('Cash payment confirmation request sent!');
      setCashRequests(prev => ({ ...prev, [month.monthName]: 'pending' }));
    } catch (err) {
      toast.error('Failed to send cash payment confirmation request.');
    }
    setLoading(false);
  };

  const handleLeaveGroupRequest = async () => {
    setLoading(true);
    try {
      await apiFetch(`${API}/request/leave`, { method: 'POST', body: { groupId } });
      toast.success('Leave group request sent!');
      setLeaveRequestStatus('pending');
    } catch (err) {
      toast.error('Failed to send leave group request.');
    }
    setLoading(false);
  };

  if (loading && !groupInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f8fa]">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!groupInfo) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f8fa] text-[14px] text-gray-400">
        Group not found.
      </div>
    );
  }

  const split = shareAmount / groupInfo.tenure;
  const completedPayments = months.filter(m => m.status === 'paid').length;
  const totalMonths = months.length;
  let progressPercentage = totalMonths > 0 ? (completedPayments / totalMonths) * 100 : 0;
  if (isNaN(progressPercentage) || !isFinite(progressPercentage)) progressPercentage = 0;
  progressPercentage = Math.max(0, Math.min(100, progressPercentage));

  const PaymentModal = ({ onClose, onSubmit, isLoading, defaultMethod }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { paymentMethod: defaultMethod || 'upi' } });
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-sm mx-4 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-semibold text-gray-900">Make Payment</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                Payment Method
              </label>
              <select
                {...register('paymentMethod', { required: 'Select a payment method' })}
                className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
              </select>
              {errors.paymentMethod && <p className="text-[12px] text-red-500 mt-1">{errors.paymentMethod.message}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              >
                {isLoading ? 'Processing…' : 'Pay Now'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f7f8fa' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-7 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav(-1)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
            <span className="text-gray-200">|</span>
            <h1 className="text-[14px] font-semibold text-gray-900">
              Group {groupInfo.groupNo}
              {adminMode && userId && firstName && (
                <span className="ml-2 text-[12px] text-gray-400 font-normal">— {firstName}</span>
              )}
            </h1>
            {adminMode && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                <Eye size={11} />
                Admin View
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black tracking-tight select-none">
              MS
            </div>
            <span className="text-[14px] font-semibold text-gray-900 tracking-tight hidden sm:block">ChitFund</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-7 py-6 sm:py-8 space-y-6 sm:space-y-7 pb-24 md:pb-20">
        {/* Progress card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Payment Progress</p>
              <p className="text-[22px] font-bold text-gray-900 tabular-nums">
                {completedPayments} <span className="text-[16px] font-normal text-gray-400">of {totalMonths} months paid</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Monthly Share</p>
              <p className="text-[18px] font-bold text-indigo-600 tabular-nums">₹{Math.round(split).toLocaleString()}</p>
            </div>
          </div>
          <Progress value={Math.round(progressPercentage)} className="h-2" />
          <div className="flex items-center justify-between mt-3 text-[12px] text-gray-400">
            <span>Total: ₹{shareAmount.toLocaleString()}</span>
            <span className="font-semibold text-indigo-600">{Math.round(progressPercentage)}% complete</span>
          </div>
        </div>

        {/* Payment schedule table */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-[14px] font-semibold text-gray-900">Payment Schedule</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Monthly breakdown — all {totalMonths} months</p>
          </div>

          {/* ── Mobile card list ────────────────────────────────── */}
          <div className="md:hidden divide-y divide-gray-100">
            {months.map((m, i) => {
              const amount = calculateAmount(m.monthName, split, hasPreBookedMonth);
              const isMyPrebookedMonth = hasPreBookedMonth === m.monthName;
              const canPrebook = m.status === 'upcoming' && !hasPreBookedMonth && adminMode === false;
              const prebookStatus = prebookStatuses[m.monthName];
              const canPay = (m.status === 'due' || m.status === 'pending') && cashRequests[m.monthName] !== 'pending';
              const payoutAmount = isMyPrebookedMonth ? (shareAmount * 0.97) : null;
              const st = STATUS_CONFIG[m.status] || STATUS_CONFIG.upcoming;
              const rowBg = isMyPrebookedMonth
                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/30'
                : (m.status === 'due' ? 'border-l-[3px] border-l-red-400 bg-red-50/20' : 'border-l-[3px] border-l-transparent');

              return (
                <div key={i} className={`px-4 py-3.5 ${rowBg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-[12px] text-gray-400 tabular-nums shrink-0 pt-0.5 w-5">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-[14px] leading-snug">{m.monthName}</p>
                        {isMyPrebookedMonth && (
                          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">⭐ Your payout — ₹{payoutAmount?.toLocaleString()}</p>
                        )}
                        {(m.paymentDate || m.paymentMethod) && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {m.paymentDate && `Paid ${new Date(m.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                            {m.paymentMethod && ` · ${m.paymentMethod}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-bold text-gray-900 tabular-nums text-[15px]">₹{Math.round(amount).toLocaleString()}</span>
                      <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${st.text}`}>
                        <span className={`w-[5px] h-[5px] rounded-full shrink-0 ${st.dot}`} />
                        {isMyPrebookedMonth ? 'Winner' : st.label}
                      </span>
                    </div>
                  </div>

                  {(canPay || (canPrebook && !prebookStatus) || (m.paymentMethod === 'cash' && m.status === 'pending' && !adminMode && !cashRequests[m.monthName])) && (
                    <div className="flex items-center gap-2 mt-3 ml-7">
                      {canPay && (
                        <button
                          onClick={() => handlePayNow(m)}
                          disabled={loading}
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 min-h-[40px]"
                        >
                          <CreditCard size={12} />
                          Pay Now
                        </button>
                      )}
                      {canPrebook && (
                        prebookStatus ? (
                          <span className={`text-[11px] font-semibold ${
                            prebookStatus === 'pending' ? 'text-amber-600' :
                            prebookStatus === 'approved' ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {prebookStatus === 'pending' ? 'Request Sent' : prebookStatus === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePreBook(m.monthName)}
                            disabled={loading}
                            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 min-h-[40px]"
                          >
                            Pre-book
                          </button>
                        )
                      )}
                      {m.paymentMethod === 'cash' && m.status === 'pending' && !adminMode && (
                        cashRequests[m.monthName] === 'pending' ? (
                          <span className="text-[11px] font-semibold text-amber-600">Confirmation Pending</span>
                        ) : cashRequests[m.monthName] === 'approved' ? (
                          <span className="text-[11px] font-semibold text-emerald-600">Cash Confirmed</span>
                        ) : (
                          <button
                            onClick={() => handleCashConfirmRequest(m)}
                            disabled={loading}
                            className="px-3 py-2 text-[12px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-60 min-h-[40px]"
                          >
                            Confirm Cash
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Desktop grid ─────────────────────────────────────── */}
          <div className="hidden md:block">
            <div
              className="grid px-5 py-2.5 bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider"
              style={{ gridTemplateColumns: '2.5rem 1fr 8rem 8rem 10rem 10rem' }}
            >
              <span>#</span>
              <span>Month</span>
              <span>Status</span>
              <span>Amount</span>
              <span>Payment Info</span>
              <span className="text-right">Action</span>
            </div>

            {months.map((m, i) => {
              const amount = calculateAmount(m.monthName, split, hasPreBookedMonth);
              const isMyPrebookedMonth = hasPreBookedMonth === m.monthName;
              const canPrebook = m.status === 'upcoming' && !hasPreBookedMonth && adminMode === false;
              const prebookStatus = prebookStatuses[m.monthName];
              const canPay = (m.status === 'due' || m.status === 'pending') && cashRequests[m.monthName] !== 'pending';
              const payoutAmount = isMyPrebookedMonth ? (shareAmount * 0.97) : null;
              const st = STATUS_CONFIG[m.status] || STATUS_CONFIG.upcoming;
              const rowBorder = isMyPrebookedMonth
                ? 'border-l-[3px] border-l-amber-400 bg-amber-50/40'
                : (m.status === 'due' ? 'border-l-[3px] border-l-red-400 bg-red-50/30' : 'border-l-[3px] border-l-transparent');

              return (
                <div
                  key={i}
                  className={`grid px-5 py-3.5 border-b border-gray-100 last:border-b-0 items-center hover:bg-gray-50/40 transition-colors text-[13px] ${rowBorder}`}
                  style={{ gridTemplateColumns: '2.5rem 1fr 8rem 8rem 10rem 10rem' }}
                >
                  <span className="text-[12px] text-gray-400 tabular-nums">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{m.monthName}</p>
                    {isMyPrebookedMonth && (
                      <p className="text-[11px] text-amber-600 font-semibold mt-0.5">⭐ Your payout — ₹{payoutAmount?.toLocaleString()}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 font-semibold text-[12px] ${st.text}`}>
                    <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${st.dot}`} />
                    {isMyPrebookedMonth ? 'Winner' : st.label}
                  </span>
                  <span className="font-semibold text-gray-900 tabular-nums">₹{Math.round(amount).toLocaleString()}</span>
                  <div className="text-[12px] text-gray-500 space-y-0.5">
                    {m.paymentDate && <p>Paid {new Date(m.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                    {m.paymentMethod && <p className="capitalize">{m.paymentMethod}</p>}
                    {m.prebookedBy && <p className="text-purple-600">Booked by {m.prebookedBy}</p>}
                    {!m.paymentDate && !m.paymentMethod && !m.prebookedBy && <span className="text-gray-300">—</span>}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    {canPay && (
                      <button
                        onClick={() => handlePayNow(m)}
                        disabled={loading}
                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[12px] font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-60"
                      >
                        <CreditCard size={11} />
                        Pay Now
                      </button>
                    )}
                    {canPrebook && (
                      prebookStatus ? (
                        <span className={`text-[11px] font-semibold ${
                          prebookStatus === 'pending' ? 'text-amber-600' :
                          prebookStatus === 'approved' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {prebookStatus === 'pending' && 'Request Sent'}
                          {prebookStatus === 'approved' && 'Approved'}
                          {prebookStatus === 'rejected' && 'Rejected'}
                          {prebookStatus === 'failed' && 'Failed'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePreBook(m.monthName)}
                          disabled={loading}
                          className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[12px] font-semibold rounded-md hover:bg-gray-50 transition-colors disabled:opacity-60"
                        >
                          Pre-book
                        </button>
                      )
                    )}
                    {m.paymentMethod === 'cash' && m.status === 'pending' && !adminMode && (
                      cashRequests[m.monthName] === 'pending' ? (
                        <span className="text-[11px] font-semibold text-amber-600">Confirmation Pending</span>
                      ) : cashRequests[m.monthName] === 'approved' ? (
                        <span className="text-[11px] font-semibold text-emerald-600">Cash Confirmed</span>
                      ) : (
                        <button
                          onClick={() => handleCashConfirmRequest(m)}
                          disabled={loading}
                          className="px-2.5 py-1 text-[12px] font-semibold bg-amber-50 border border-amber-200 text-amber-700 rounded-md hover:bg-amber-100 transition-colors disabled:opacity-60"
                        >
                          Confirm Cash
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave group */}
        {(() => {
          if (adminMode || months.length === 0) return null;
          const hasOpenDues = months.some(m => m.status === 'due' || m.status === 'pending');
          if (hasOpenDues) return null;
          // Group is completed when its tenure window has fully elapsed
          const isCompleted = groupInfo && (() => {
            const end = new Date(groupInfo.startMonth);
            end.setMonth(end.getMonth() + (groupInfo.tenure || 0));
            return end <= new Date();
          })();
          if (isCompleted) return null;
          return (
          <div className="flex justify-end pt-2">
            {leaveRequestStatus === 'pending' ? (
              <span className="text-[13px] text-amber-600 font-semibold">Leave request pending…</span>
            ) : (
              <button
                onClick={handleLeaveGroupRequest}
                disabled={loading}
                className="px-4 py-2 text-[13px] font-semibold text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                Request to Leave Group
              </button>
            )}
          </div>
          );
        })()}
      </div>

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSubmit={submitPayment}
          isLoading={loading}
          defaultMethod={paymentMethod}
        />
      )}
    </div>
  );
};
