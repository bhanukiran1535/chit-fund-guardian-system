import React, { useEffect, useState } from "react";
import { BadgeCheck, Clock, AlertCircle, Info } from "lucide-react";
import './RequestNotifications.css';

export const RequestNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_BASE}/request/my`, { credentials: 'include' });
        const data = await res.json();
        const formatted = data.requests.map(formatNotification);
        setNotifications(formatted);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

const formatNotification = (notif) => {
  let title = "";
  let message = "";

  const amount = `₹${notif.amount || "?"}`;
  const group = `Group #${notif.groupNo || notif.groupId?.groupNo || "?"}`;
  const status = notif.status || "pending";

  switch (notif.type) {
    case "join_group":
      title = "Join Group Request";
      if (status === "pending") {
        message = `Your request to join Group with ${amount} ChitValue is pending approval.`;
      } else if (status === "approved") {
        message = `You’ve been added to ${group} of ${amount}.`;
      } else if (status === "rejected") {
        message = `Your join request for ${amount} couldn't be processed — no slots available in active groups.`;
      } else {
        message = `Your join request status for ${amount} in ${group} is: ${status}.`;
      }
      break;

    case "month_prebook":
      title = `Pre-book Request for ${notif.monthName || "a month"}`;
      if (status === "pending") {
        message = `You requested ${amount} payout in ${group}. Waiting for admin approval.`;
      } else if (status === "approved") {
        message = `Your pre-book for ${amount} in ${group} has been approved!`;
      } else if (status === "rejected") {
        message = `Your pre-book request for ${amount} in ${group} was rejected.`;
      } else {
        message = `Your pre-book status for ${amount} in ${group} is: ${status}.`;
      }
      break;

    case "confirm_cash_payment":
      title = "Cash Payment Confirmation";
      if (status === "pending") {
        message = `You submitted ${amount} cash for ${group}. Awaiting confirmation.`;
      } else if (status === "approved") {
        message = `Your cash payment of ${amount} for ${group} has been confirmed.`;
      } else if (status === "rejected") {
        message = `Your cash payment of ${amount} for ${group} was rejected. Please verify with admin.`;
      } else {
        message = `Your cash payment status for ${group} is: ${status}.`;
      }
      break;

    default:
      title = "Notification";
      message = "You have a new notification.";
  }

  return {
    ...notif,
    title,
    message,
  };
};


  const getStatusIconClass = (status) => {
    switch (status) {
      case "approved": return "status-icon green";
      case "rejected": return "status-icon red";
      case "pending": return "status-icon yellow";
      default: return "status-icon gray";
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getStatusIcon = (status) => {
    const iconProps = { className: getStatusIconClass(status) };
    switch (status) {
      case "approved": return <BadgeCheck {...iconProps} />;
      case "rejected": return <AlertCircle {...iconProps} />;
      case "pending": return <Clock {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };

  return (
    <div className="notifications-card">
      <div className="card-header">
        <div className="header-content">
          <Info className="header-icon" />
          <h2 className="card-title">Notifications</h2>
        </div>
      </div>

      <div className="card-content">
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Info className="empty-icon" />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification._id} className="notification-item">
                <div className="notification-icon">{getStatusIcon(notification.status)}</div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className={getStatusBadgeClass(notification.status)}>
                      {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                    </span>
                  </div>

                  <p className="notification-message">{notification.message}</p>

                  <div className="notification-footer">
                    <div className="notification-meta">
                      <span>Group: {notification.groupNo || "N/A"}</span>
                      <span>•</span>
                      <span>
                        {notification.timestamp
                          ? new Date(notification.timestamp).toLocaleDateString()
                          : "No Date"}
                      </span>
                    </div>
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
