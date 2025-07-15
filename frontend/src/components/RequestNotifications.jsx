
import { Bell, CheckCircle, XCircle, Clock, Users, DollarSign } from 'lucide-react';
import './RequestNotifications.css';

export const RequestNotifications = () => {
  // Mock notification data
  const notifications = [
    {
      id: '1',
      type: 'join_group',
      title: 'Group Join Request Approved',
      message: 'Your request to join Group G001 has been approved by admin.',
      status: 'approved',
      timestamp: '2024-03-10T10:30:00Z',
      groupNo: 'G001'
    },
    {
      id: '2',
      type: 'payment_confirmation',
      title: 'Payment Confirmation Pending',
      message: 'Your cash payment for Group G002 - March 2024 is pending admin confirmation.',
      status: 'pending',
      timestamp: '2024-03-12T14:20:00Z',
      groupNo: 'G002'
    },
    {
      id: '3',
      type: 'payout_booking',
      title: 'Payout Pre-booking Confirmed',
      message: 'Your pre-booking for Month 5 payout in Group G001 has been confirmed.',
      status: 'approved',
      timestamp: '2024-03-08T16:45:00Z',
      groupNo: 'G001'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="status-icon green" />;
      case 'rejected': return <XCircle className="status-icon red" />;
      case 'pending': return <Clock className="status-icon yellow" />;
      default: return <Bell className="status-icon gray" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = `status-badge status-${status}`;
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={statusClass}>{statusText}</span>;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'join_group': return <Users className="type-icon blue" />;
      case 'payment_confirmation': return <DollarSign className="type-icon green" />;
      case 'payout_booking': return <CheckCircle className="type-icon purple" />;
      default: return <Bell className="type-icon gray" />;
    }
  };

  return (
    <div className="notifications-card">
      <div className="card-header">
        <div className="header-content">
          <Bell className="header-icon" />
          <div>
            <h2 className="card-title">Request Notifications</h2>
            <p className="card-subtitle">Stay updated on your group requests and payment confirmations</p>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell className="empty-icon" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <div className="notification-icon">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <div className="notification-status">
                      {getStatusIcon(notification.status)}
                      {getStatusBadge(notification.status)}
                    </div>
                  </div>
                  
                  <p className="notification-message">{notification.message}</p>
                  
                  <div className="notification-footer">
                    <div className="notification-meta">
                      <span>Group: {notification.groupNo}</span>
                      <span>•</span>
                      <span>{new Date(notification.timestamp).toLocaleDateString()}</span>
                    </div>
                    {notification.status === 'pending' && (
                      <button className="view-btn">View Details</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
