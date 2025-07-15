import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GroupMonthDetails.css';

export const GroupMonthDetails = () => {
  const [months, setMonths] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [shareAmount, setShareAmount] = useState(0);
  const [HasPreBooked, setHasPreBooked] = useState("");
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
          return (
            <div key={i} className="month-item">
              <div className={`timeline-ball ${m.status}`} />
              <div className="month-info">
                <div className="row">
                  <span>{m.monthName}</span>
                  <span className={`badge ${m.status}`}>{m.status}</span>
                </div>
                <p>Amount: ₹{amount.toLocaleString()}</p>
                {m.paymentDate && <p>Paid on: {new Date(m.paymentDate).toLocaleDateString()}</p>}
                <p>Method: {m.paymentMethod || 'N/A'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
