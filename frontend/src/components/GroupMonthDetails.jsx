import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, Clock, CheckCircle, AlertCircle, TrendingUp, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { useLocation } from 'react-router-dom';
import './GroupMonthDetails.css';

export const GroupMonthDetails = () => {
  const location = useLocation();
  const routeState = location.state || {};
  const userId = routeState.userId;
  const propGroup = routeState.group;
  const adminMode = routeState.adminMode ?? false;

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

useEffect(() => {
  async function loadData() {
    try {
      if (!groupId) return;

      const requestBody = {
        groupIds: [groupId],
      };
      console.log(userId);
      if (adminMode && userId) {
        requestBody.userId = userId;
      }

      const [mRes, gRes] = await Promise.all([
        fetch(`${API}/month/my`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        }),
        fetch(`${API}/group/${groupId}`, {
          credentials: 'include',
        }),
      ]);
      const mData = await mRes.json();
      console.log(mData);
      const gData = await gRes.json();

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
    }catch (err) {
      console.error('Failed to load group/month details:', err);
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
          data.requests
          .filter(r => r.type === 'month_prebook' && r.groupId._id === groupId)
          .forEach(r => {
              statuses[r.monthName] = r.status;
              if (r.status === 'approved') {
                setHasPreBookedMonth(r.monthName); // set prebooked month from request if approved
              }
            });
          setPrebookStatuses(statuses);
        }
      } catch (err) {
        console.error("Failed to fetch prebook requests", err);
      }
    }

    fetchPrebookRequests();
  }, [API, groupId]);

  const handlePreBook = async (monthName) => {
    setLoading(true);
    setPrebookStatuses(prev => ({ ...prev, [monthName]: 'pending' }));

    try {
      const response = await fetch(`${API}/request/prebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groupId, monthName, shareAmount }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.status === 'approved') {
          setPrebookStatuses(prev => ({ ...prev, [monthName]: 'approved' }));
          setHasPreBookedMonth(monthName);
        } else {
          setPrebookStatuses(prev => ({ ...prev, [monthName]: 'pending' }));
        }
      } else {
        setPrebookStatuses(prev => ({ ...prev, [monthName]: 'failed' }));
      }
    } catch (error) {
      console.error('Prebook failed:', error);
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

  const submitPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/payment/make`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          groupId,
          monthName: selectedMonth.monthName,
          paymentMethod,
          paymentDate: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowPaymentModal(false);
        location.reload();
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
    setLoading(false);
  };

  if (!groupInfo) return <div className="loading">🌀 Loading...</div>;

  const split = shareAmount / groupInfo.tenure;
  const handleBack = () => nav(-1);
 
  const completedPayments = months.filter(m => m.status === 'paid').length;
  const totalMonths = months.length;
  const progressPercentage = totalMonths > 0 ? (completedPayments / totalMonths) * 100 : 0;

  return (
    <div className="month-details-page">
      <div className="page-header">
        <button className="back-btn" onClick={handleBack}>
          ← {'Group List'}
        </button>
      </div>
      <h1>Group {groupInfo.groupNo}: Monthly Breakdown</h1>
      
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

          const canPrebook = m.status === 'upcoming' && !hasPreBookedMonth;

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
                  </div>
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <span className="label">Amount:</span>
                    <span className="value">₹{amount.toLocaleString()}</span>
                  </div>

                  {m.paymentDate && (
                    <div className="detail-row">
                      <span className="label">Paid on:</span>
                      <span className="value">{new Date(m.paymentDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <span className="label">Method:</span>
                    <span className="value">{m.paymentMethod || 'N/A'}</span>
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
        <div className="modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>Make Payment</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="payment-summary">
                <p><strong>Month:</strong> {selectedMonth?.monthName}</p>
                <p><strong>Amount:</strong> ₹{(hasPreBookedMonth === selectedMonth?.monthName
                  ? split + (shareAmount * 0.01)
                  : split
                ).toLocaleString()}</p>
              </div>

              <div className="payment-method">
                <label>Payment Method:</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button className="confirm-btn" onClick={submitPayment} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
