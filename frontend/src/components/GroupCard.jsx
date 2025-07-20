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
      default: return 'status-default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'pending': return 'Payment Pending';
      case 'paid': return 'Paid';
      case 'due': return 'Payment Due';
      default: return 'Unknown';
    }
  };

  const startMonth = new Date(group.startMonth).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  });

  const handleDetailsClick = () => {
    navigate(`/user/group/${group._id}/details`, { state: { group } });
  };
  console.log(group);
  return (
    <div className="group-card">
      <div className="card-header">
        <div className="card-title-section">
          <h3 className="card-title">Group {group.groupNo}</h3>
          <p className="card-subtitle">Started: {startMonth}</p>
        </div>
        <div className={`status-badge ${getStatusClass(group.myPaymentStatus)}`}>
          {getStatusText(group.myPaymentStatus)}
        </div>
      </div>

      <div className="card-content">
        <div className="info-grid">
          <div className="info-item">
            <DollarSign className="info-icon green" />
            <span className="info-label">Value:</span>
            <span className="info-value">₹{group.shareAmount.toLocaleString()}</span>
          </div>

          <div className="info-item">
            <Calendar className="info-icon blue" />
            <span className="info-label">Tenure:</span>
            <span className="info-value">{group.tenure} months</span>
          </div>

          <div className="info-item">
            <Clock className="info-icon orange" />
            <span className="info-label">Progress:</span>
            <span className="info-value">{group.currentMonth}/{group.tenure}</span>
          </div>

          <div className="info-item">
            <Calendar className="info-icon purple" />
            <span className="info-label">Payout Month:</span>
<span className="info-value">
  {group.preBookedMonth ? group.preBookedMonth : 'Not Taken'}
</span>

          </div>
        </div>

        <div className="card-actions">
          <button
            className={`action-btn ${group.myPaymentStatus === 'due' || group.myPaymentStatus === 'pending' ? 'primary' : 'secondary'}`}
            onClick={handleDetailsClick}
          >
            {group.myPaymentStatus === 'due' || group.myPaymentStatus === 'pending' ? 'Pay Now' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};