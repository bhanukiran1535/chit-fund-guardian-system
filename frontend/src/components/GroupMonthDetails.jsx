import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import './GroupMonthDetails.css';

export const GroupMonthDetails = () => {
  const [months, setMonths] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [shareAmount, setShareAmount] = useState(0);
  const [HasPreBooked, setHasPreBooked] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const { groupId } = useParams();
  const API = import.meta.env.VITE_API_BASE_URL;
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      const [mRes, gRes] = await Promise.all([
        fetch(`${API}/month/my`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ groupIds: [groupId] }),
        }),
        fetch(`${API}/group/${groupId}`, { credentials: 'include' }),
      ]);
 
      const mData = await mRes.json();
      const gData = await gRes.json();
      // if (mData.success) setMonths(mData.months);
      if (mData.success) {
      const sorted = mData.months.sort((a, b) => {
        const [monthA, yearA] = a.monthName.split(' ');
        const [monthB, yearB] = b.monthName.split(' ');
        const dateA = new Date(`${monthA} 1, ${yearA}`);
        const dateB = new Date(`${monthB} 1, ${yearB}`);
        return dateA - dateB;
      });
      setMonths(sorted);
    }
      if (gData.success) {
        setGroupInfo(gData.group);
        const member = gData.group.members.find(m => m.userId === gData.userId);
        setShareAmount(member?.shareAmount || 0);
        setHasPreBooked(member?.preBookedMonth || "");
      }
    }
    load();
  }, [API, groupId]);

  const handlePreBook = async (monthName) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/month/prebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ groupId, monthName })
      });
      const data = await response.json();
      if (data.success) {
        // Refresh the month data
        location.reload();
      }
    } catch (error) {
      console.error('Prebook failed:', error);
    }
    setLoading(false);
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
          paymentDate: new Date().toISOString()
        })
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

  return (
    <div className="month-details-page">
      <button className="back-btn" onClick={handleBack}>← Group List</button>
      <h1>Group {groupInfo.groupNo}: Monthly Breakdown</h1>
      <div className="timeline-container">
        <div className="timeline-bar" />
        {months.map((m, i) => {
          const extra = m.extraMonthlyPayment || 0;
          const amount = HasPreBooked ? split + extra : split;
          const canPrebook = m.status === 'upcoming' && !m.prebookedBy && !HasPreBooked;
          const canPay = m.status === 'due' || m.status === 'pending';
          
          return (
            <div key={i} className="month-item">
              <div className={`timeline-ball ${m.status}`}>
                {m.status === 'paid' && <CheckCircle size={12} className="status-icon" />}
                {m.status === 'due' && <AlertCircle size={12} className="status-icon" />}
                {m.status === 'pending' && <Clock size={12} className="status-icon" />}
                {m.status === 'upcoming' && <Calendar size={12} className="status-icon" />}
              </div>
              
              <div className="month-info">
                <div className="month-header">
                  <div className="month-title">
                    <h3>{m.monthName}</h3>
                    <span className={`badge ${m.status}`}>{m.status}</span>
                  </div>
                  
                  <div className="month-actions">
                    {canPrebook && (
                      <button 
                        className="prebook-btn"
                        onClick={() => handlePreBook(m.monthName)}
                        disabled={loading}
                      >
                        Pre-book
                      </button>
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>Make Payment</h3>
              <button 
                className="close-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="payment-summary">
                <p><strong>Month:</strong> {selectedMonth?.monthName}</p>
                <p><strong>Amount:</strong> ₹{(HasPreBooked ? split + (selectedMonth?.extraMonthlyPayment || 0) : split).toLocaleString()}</p>
              </div>
              
              <div className="payment-method">
                <label>Payment Method:</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-btn"
                  onClick={submitPayment}
                  disabled={loading}
                >
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
