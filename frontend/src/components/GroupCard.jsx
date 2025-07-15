<<<<<<< HEAD:src/components/GroupCard.jsx

import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import './GroupCard.css';

export const GroupCard = ({ group }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'due': return 'status-due';
      case 'pending': return 'status-pending';
=======
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GroupCard.css';

export const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'pending': return 'status-pending';
      case 'paid': return 'status-paid';
      case 'due': return 'status-due';
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
      default: return 'status-default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
<<<<<<< HEAD:src/components/GroupCard.jsx
      case 'paid': return 'Paid';
      case 'due': return 'Payment Due';
      case 'pending': return 'Pending';
=======
      case 'upcoming': return 'Upcoming';
      case 'pending': return 'Payment Pending';
      case 'paid': return 'Paid';
      case 'due': return 'Payment Due';
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
      default: return 'Unknown';
    }
  };

<<<<<<< HEAD:src/components/GroupCard.jsx
=======
  const startMonth = new Date(group.startMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const handleDetailsClick = () => {
    navigate(`/group/${group._id}/details`, { state: { group } });
  };

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
  return (
    <div className="group-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">Group {group.groupNo}</h3>
<<<<<<< HEAD:src/components/GroupCard.jsx
          <p className="card-subtitle">Started: {group.startMonth}</p>
=======
          <p className="card-subtitle">Started: {startMonth}</p>
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
        </div>
        <div className={`status-badge ${getStatusClass(group.myPaymentStatus)}`}>
          {getStatusText(group.myPaymentStatus)}
        </div>
      </div>
<<<<<<< HEAD:src/components/GroupCard.jsx
      
=======

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <DollarSign className="info-icon green" />
            <span className="info-label">Value:</span>
<<<<<<< HEAD:src/components/GroupCard.jsx
            <span className="info-value">₹{group.chitValue.toLocaleString()}</span>
          </div>
          
=======
            <span className="info-value">₹{group.shareAmount.toLocaleString()}</span>
          </div>

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
          <div className="info-item">
            <Calendar className="info-icon blue" />
            <span className="info-label">Tenure:</span>
            <span className="info-value">{group.tenure} months</span>
          </div>
<<<<<<< HEAD:src/components/GroupCard.jsx
          
=======

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
          <div className="info-item">
            <Clock className="info-icon orange" />
            <span className="info-label">Progress:</span>
            <span className="info-value">{group.currentMonth}/{group.tenure}</span>
          </div>
<<<<<<< HEAD:src/components/GroupCard.jsx
          
          <div className="info-item">
            <Calendar className="info-icon purple" />
            <span className="info-label">Next Due:</span>
            <span className="info-value">{new Date(group.nextPaymentDue).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="card-actions">
          <button className={`action-btn ${group.myPaymentStatus === 'due' ? 'primary' : 'secondary'}`}>
            {group.myPaymentStatus === 'due' ? 'Pay Now' : 'View Details'}
=======

          <div className="info-item">
            <Calendar className="info-icon purple" />
            <span className="info-label">Next Due:</span>
            <span className="info-value">{group.nextPaymentDue ? new Date(group.nextPaymentDue).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div className="card-actions">
          <button
            className={`action-btn ${group.myPaymentStatus === 'due' || group.myPaymentStatus === 'pending' ? 'primary' : 'secondary'}`}
            onClick={handleDetailsClick}
          >
            {group.myPaymentStatus === 'due' || group.myPaymentStatus === 'pending' ? 'Pay Now' : 'View Details'}
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/GroupCard.jsx
          </button>
          <button className="action-btn secondary">
            Pre-book Payout
          </button>
        </div>
      </div>
    </div>
  );
};
