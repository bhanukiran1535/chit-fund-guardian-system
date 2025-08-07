import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, Eye, Clock, CheckCircle, AlertCircle, TrendingUp, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { useLocation } from 'react-router-dom';
import './GroupMonthDetails.css';
import { getCsrfToken } from '../lib/utils';
import { apiFetch } from '../lib/api';
import { useForm } from 'react-hook-form';
import { toast } from './ui/sonner';

export const GroupMonthDetails = ({ 
  adminMode: propAdminMode, 
  userId: propUserId
} = {}) => {
  const location = useLocation();
  const routeState = location.state || {};
  
  // Support both props and route state for flexibility
  const userId = propUserId || routeState.userId;
  console.log(routeState);
  const firstName = routeState.user?.firstName;
  const propGroup = routeState.group;
  const adminMode = propAdminMode ?? routeState.adminMode ?? false;

  const [months, setMonths] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [shareAmount, setShareAmount] = useState(0);
  const [hasPreBookedMonth, setHasPreBookedMonth] = useState("");
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
      const mData = await apiFetch(`${API}/month/my`, {
        method: 'POST',
        body: requestBody,
        showToast: false
      });
      const gData = await apiFetch(`${API}/group/${groupId}${adminMode && userId ? `?userId=${userId}` : ''}`, {
        showToast: false
      });
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
        setHasPreBookedMonth(member?.preBookedMonth || "");
      }
    } catch (err) {
      // error toast handled by apiFetch
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
              if (r.status === 'approved') {
                setHasPreBookedMonth(r.monthName); // set prebooked month from request if approved
              }
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
          // Only show leave request status if user is still not a member
          if (groupInfo && groupInfo.members && groupInfo.members.some(m => m.userId === gData.userId)) {
            setLeaveRequestStatus(null);
          } else {
            setLeaveRequestStatus(leaveStatus);
          }
        }
      } catch (err) {
        console.error("Failed to fetch prebook/cash/leave requests", err);
      }
    }

    fetchPrebookRequests();
  }, [API, groupId, groupInfo]);

  const handlePreBook = async (monthName) => {
    setLoading(true);
    setPrebookStatuses(prev => ({ ...prev, [monthName]: 'pending' }));

    try {
      await apiFetch(`${API}/request/prebook`, {
        method: 'POST',
        body: { groupId, monthName, shareAmount },
      });
      setPrebookStatuses(prev => ({ ...prev, [monthName]: 'pending' }));
    } catch (error) {
      setPrebookStatuses(prev => ({ ...prev, [monthName]: 'failed' }));
    }

    setLoading(false);
  };
  
  const calculateAmount = (monthName, base, prebookMonth) => {
  const allMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!prebookMonth) return base;

  const [preMonth, preYear] = prebookMonth.split(' ');
  const [curMonth, curYear] = monthName.split(' ');

  const preIndex = allMonths.indexOf(preMonth) + parseInt(preYear) * 12;
  const curIndex = allMonths.indexOf(curMonth) + parseInt(curYear) * 12;

  return curIndex >= preIndex ? base + base * 0.2 : base;
};


  const handlePayNow = (month) => {
    setSelectedMonth(month);
    setShowPaymentModal(true);
  };

  const submitPayment = async (data) => {
    setLoading(true);
    try {
      if (data.paymentMethod === 'cash' && !adminMode) {
        // Only send cash confirmation request, do not mark as paid
        await apiFetch(`${API}/request/payment`, {
          method: 'POST',
          body: {
            groupId,
            monthName: selectedMonth.monthName,
            amount: calculateAmount(selectedMonth.monthName, split, hasPreBookedMonth),
          },
        });
        setShowPaymentModal(false);
        toast.success('Cash payment confirmation request sent!');
        // Optionally refresh requests
        const res = await fetch(`${API}/request/my`, { credentials: 'include' });
        const dataReq = await res.json();
        if (dataReq.success) {
          const cashReqs = {};
          dataReq.requests.forEach(r => {
            if (r.type === 'confirm_cash_payment' && r.groupId._id === groupId) {
              cashReqs[r.monthName] = r.status;
            }
          });
          setCashRequests(cashReqs);
        }
      } else {
        // Normal payment flow for UPI/bank
        await apiFetch(`${API}/payment/make`, {
          method: 'POST',
          body: {
            groupId,
            monthName: selectedMonth.monthName,
            paymentMethod: data.paymentMethod,
            paymentDate: new Date().toISOString(),
          },
        });
        setShowPaymentModal(false);
        location.reload();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed.');
    }
    setLoading(false);
  };

  const handleCashConfirmRequest = async (month) => {
    setLoading(true);
    try {
      await apiFetch(`${API}/request/payment`, {
        method: 'POST',
        body: {
          groupId,
          monthName: month.monthName,
          amount: calculateAmount(month.monthName, split, hasPreBookedMonth),
        },
      });
      toast.success('Cash payment confirmation request sent!');
      // Refresh requests
      const res = await fetch(`${API}/request/my`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const cashReqs = {};
        data.requests.forEach(r => {
          if (r.type === 'confirm_cash_payment' && r.groupId._id === groupId) {
            cashReqs[r.monthName] = r.status;
          }
        });
        setCashRequests(cashReqs);
      }
    } catch (err) {
      toast.error('Failed to send cash payment confirmation request.');
    }
    setLoading(false);
  };

  const handleLeaveGroupRequest = async () => {
    setLoading(true);
    try {
      await apiFetch(`${API}/request/leave`, {
        method: 'POST',
        body: { groupId },
      });
      toast.success('Leave group request sent!');
      setLeaveRequestStatus('pending');
    } catch (err) {
      toast.error('Failed to send leave group request.');
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!groupInfo) return <div className="loading">Group not found.</div>;

  const split = shareAmount / groupInfo.tenure;
  const handleBack = () => nav(-1);
 
  const completedPayments = months.filter(m => m.status === 'paid').length;
  const totalMonths = months.length;
  let progressPercentage = totalMonths > 0 ? (completedPayments / totalMonths) * 100 : 0;
  if (isNaN(progressPercentage) || !isFinite(progressPercentage)) progressPercentage = 0;
  progressPercentage = Math.max(0, Math.min(100, progressPercentage));

  const PaymentModal = ({ onClose, onSubmit, isLoading, defaultMethod }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { paymentMethod: defaultMethod || 'upi' } });
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3>Make Payment</h3>
            <select {...register('paymentMethod', { required: 'Select a payment method' })}>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
            </select>
            {errors.paymentMethod && <span className="error">{errors.paymentMethod.message}</span>}
            <button type="submit" disabled={isLoading}>{isLoading ? 'Processing...' : 'Pay Now'}</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="month-details-page">
      <div className="page-header">
        <button className="back-btn" onClick={handleBack}>
          ← {'Group List'}
        </button>
        {adminMode && (
          <div className="admin-badge">
            <span className="badge admin-view"><Eye size={16} /> Admin View</span>
          </div>
        )}
      </div>
      <h1>
        Group {groupInfo.groupNo}: Monthly Breakdown
        {adminMode && userId && (
          <span className="user-context"> - User: {firstName}</span>
        )}
      </h1>
      
      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-header">
          <div className="progress-stats">
            <TrendingUp className="progress-icon" />
            <span className="progress-text">
              {completedPayments} of {totalMonths} payments completed
            </span>
          </div>
          <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={Math.round(progressPercentage)} className="progress-bar" />
        <div className="progress-details">
          <span>Total Amount: ₹{shareAmount.toLocaleString()}</span>
          <span>Monthly Share: ₹{split.toLocaleString()}</span>
        </div>
      </div>

      <div className="timeline-container">
        <div className="timeline-bar" />
        {months.map((m, i) => {
          const amount = calculateAmount(m.monthName, split, hasPreBookedMonth);

          const canPrebook = m.status === 'upcoming' && !hasPreBookedMonth && adminMode===false;

          const prebookStatus = prebookStatuses[m.monthName];
          const canPay = m.status === 'due' || m.status === 'pending';

          // Check if this month is the user's prebooked and approved month
          const isMyPrebookedMonth = hasPreBookedMonth === m.monthName;

          // Calculate payout amount for prebooked winner
          const payoutAmount = isMyPrebookedMonth ? (shareAmount * 0.97) : null; // 97% after 3% foreman commission

          return (
            <div key={i} className={`month-item ${isMyPrebookedMonth ? 'prebooked-winner-month' :'' }`}>
              <div className={`timeline-ball ${m.status} ${isMyPrebookedMonth ? 'prebooked' : ''}`}>
                {m.status === 'paid' && <CheckCircle size={12} className="status-icon" />}
                {m.status === 'due' && <AlertCircle size={12} className="status-icon" />}
                {m.status === 'pending' && <Clock size={12} className="status-icon" />}
                {m.status === 'upcoming' && <Calendar size={12} className="status-icon" />}
                {isMyPrebookedMonth && <span className="winner-star">⭐</span>}
              </div>

              <div className={`month-info ${isMyPrebookedMonth ? 'prebooked-winner-card' : ''}`}>
                
                <div className="month-header">
                  <div className="month-title">
                    <h3>{m.monthName}</h3>
                    <span className={`badge ${m.status} ${isMyPrebookedMonth ? 'winner-badge' : ''}`}>
                      {isMyPrebookedMonth ? 'WINNER' : m.status}
                    </span>
                  </div>
                  {isMyPrebookedMonth && (
                  <div className="winner-banner">
                    <span className="winner-text">YOU WIN THIS MONTH!</span>
                    <span className="payout-amount">Payout: ₹{payoutAmount?.toLocaleString()}</span>
                  </div>
                  )}
                  <div className="month-actions">
                    {canPrebook && (
                      prebookStatus ? (
                        <div className={`badge ${prebookStatus}`}>
                          {prebookStatus === 'pending' && 'Request Sent'}
                          {prebookStatus === 'approved' && 'Approved'}
                          {prebookStatus === 'rejected' && 'Rejected'}
                          {prebookStatus === 'failed' && 'Failed'}
                        </div>
                      ) : (
                        <button
                          className="prebook-btn"
                          onClick={() => handlePreBook(m.monthName)}
                          disabled={loading}
                        >
                          Pre-book
                        </button>
                      )
                    )}

                    {canPay && (
                      <button
                        className="pay-btn"
                        onClick={() => handlePayNow(m)}
                        disabled={loading}
                      >
                        <CreditCard size={16} />
                        Pay Now
                      </button>
                    )}
                    {/* Cash confirmation request button */}
                    {m.paymentMethod === 'cash' && m.status === 'pending' && !adminMode && (
                      cashRequests[m.monthName] === 'pending' ? (
                        <div className="badge pending">Cash Confirmation Pending</div>
                      ) : cashRequests[m.monthName] === 'approved' ? (
                        <div className="badge approved">Cash Confirmed</div>
                      ) : (
                        <button
                          className="cash-confirm-btn"
                          onClick={() => handleCashConfirmRequest(m)}
                          disabled={loading}
                        >
                          Request Cash Payment Confirmation
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <span className="label">Amount to be paid:</span>
                    <span className="value">₹{amount.toLocaleString()}</span>
                  </div>

                  {m.paymentDate && (
                    <div className="detail-row">
                      <span className="label">Paid on:</span>
                      <span className="value">{new Date(m.paymentDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="label">Mode of Payment:</span>
                    <span className="value">{m.paymentMethod || '-'}</span>
                  </div>

                  {m.prebookedBy && (
                    <div className="detail-row">
                      <span className="label">Pre-booked by:</span>
                      <span className="value prebooked">{m.prebookedBy}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSubmit={submitPayment}
          isLoading={loading}
          defaultMethod={paymentMethod}
        />
      )}
      {/* Bottom of the page: Leave Group Button */}
      {!adminMode && months.length > 0 && months.every(m => m.status !== 'due' && m.status !== 'pending') && (
        <div className="leave-group-section">
          {leaveRequestStatus === 'pending' ? (
            <div className="badge pending">Leave Group Request Pending</div>
          ) : (
            <button
              className="leave-group-btn"
              onClick={handleLeaveGroupRequest}
              disabled={loading}
            >
              Request to Leave Group
            </button>
          )}
        </div>
      )}
    </div>
  );
};
