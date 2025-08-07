import React, { useEffect, useState } from "react";
import { BadgeCheck, Clock, AlertCircle, Info, Users, DollarSign } from "lucide-react";
import './RequestNotifications.css';
import { apiFetch } from '../lib/api';

const typeIcon = {
  join_group: <Users className="notif-icon blue" />,
  leave_group: <AlertCircle className="notif-icon red" />,
  confirm_cash_payment: <DollarSign className="notif-icon green" />,
  month_prebook: <Clock className="notif-icon purple" />,
};

const statusText = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const RequestNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`${API_BASE}/request/my`, { showToast: false });
        setNotifications(Array.isArray(data.requests) ? data.requests : []);
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div className="notification-message">Loading notifications...</div>;
  if (notifications.length === 0) return <div className="empty-state">No notifications.</div>;

  return (
    <div className="notifications-list">
      <h3 className="notification-title">Notifications</h3>
      <ul>
        {notifications.map((notif) => (
          <li key={notif._id} className={`notification-item notification-${notif.status}`}>
            <span className="notification-icon">{typeIcon[notif.type] || <Info className="type-icon" />}</span>
            <div className="notification-content">
              <div className="notification-header">
                <span className="notification-title">{notif.type.replace(/_/g, ' ')}</span>
                <span className={`status-badge status-${notif.status}`}>{statusText[notif.status] || notif.status}</span>
              </div>
              <div className="notification-meta">
                {notif.amount && <span>Amount: ₹{notif.amount.toLocaleString()}</span>}
                {notif.monthName && <span>Month: {notif.monthName}</span>}
                <span>{new Date(notif.timestamp || notif.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
