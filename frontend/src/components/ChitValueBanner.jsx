import { useEffect, useState } from 'react';

const chitValues = [50000, 100000, 200000, 500000];

export const ChitValueBanner = () => {
  const [filteredChits, setFilteredChits] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/group/status/upcoming`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const upcomingGroups = data.groups;

          const filtered = chitValues
            .map(val => {
              const group = upcomingGroups
                .filter(g => g.chitValue >= val)
                .sort((a, b) => new Date(a.startMonth) - new Date(b.startMonth))[0];

              if (!group) return null;

              return {
                chitValue: val,
                tenure: group.tenure,
                startMonth: new Date(group.startMonth).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                }),
              };
            })
            .filter(Boolean);

          setFilteredChits(filtered);
        }
      });
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/request/my`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const joinRequests = data.requests
            .filter(req => req.type === 'join_group' && req.status === 'pending')
            .map(req => req.amount);
          setMyRequests(joinRequests);
        }
      });
  }, []);

  const requestToJoin = async (amount) => {
    const confirm = window.confirm(`Are you sure you want to request a ₹${amount.toLocaleString()} chit?`);
    if (!confirm) return;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    alert(data.message || 'Request submitted.');

    if (data.success) {
      setMyRequests(prev => [...prev, amount]);
    }
  };

  const withdrawRequest = async (amount) => {
    const confirm = window.confirm(`Withdraw your request for ₹${amount.toLocaleString()}?`);
    if (!confirm) return;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount, type: 'join_group' }),
    });

    const data = await res.json();
    alert(data.message || 'Request withdrawn.');

    if (data.success) {
      setMyRequests(prev => prev.filter(a => a !== amount));
    }
  };

  return (
    <div className="upcoming-banner">
      <div className="banner-title">Available Chit Values</div>
      <div className="banner-slider">
        {filteredChits.map((item, index) => {
          const alreadyRequested = myRequests.includes(item.chitValue);

          return (
            <div className="banner-card" key={index}>
              <h3>₹{item.chitValue.toLocaleString()}</h3>
              <p>Tenure: {item.tenure} months</p>
              <p>Start: {item.startMonth}</p>

              {alreadyRequested ? (
                <>
                  <button className="join-btn" disabled>Request Sent</button>
                  <button
                    className="join-btn"
                    style={{ background: '#ef4444', margin: '0.4rem' }}
                    onClick={() => withdrawRequest(item.chitValue)}
                  >
                    Withdraw Request
                  </button>
                </>
              ) : (
                <button
                  className="join-btn"
                  onClick={() => requestToJoin(item.chitValue)}
                >
                  Request to Join
                </button>
              )}
            </div>
          );
        })}

        {/* ✅ Custom Amount Banner */}
        <div className="banner-card flex flex-col">
          <h3>Custom Chit Amount</h3>
          <input
            type="number"
            placeholder="Enter Amount (e.g. 600000)"
            value={customAmount}
            onChange={(e) => setCustomAmount(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg mb-2"
          />

          {myRequests.includes(customAmount) ? (
            <>
              <button className="join-btn" disabled>Request Sent</button>
              <button
                className="join-btn"
                style={{ background: '#ef4444', margin: '0.4rem' }}
                onClick={() => withdrawRequest(customAmount)}
              >
                Withdraw Request
              </button>
            </>
          ) : (
            <button
              className="join-btn"
              onClick={() => {
                if (customAmount >= 10000) {
                  requestToJoin(customAmount);
                  setCustomAmount('');
                } else {
                  alert('Please enter a valid amount (₹10,000 or more).');
                }
              }}
            >
              Request Custom Amount
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
