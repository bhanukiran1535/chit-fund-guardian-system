import { Bell, LogOut, Shield, User } from 'lucide-react';
import './Header.css';
import { useEffect, useState } from 'react';
import ProfileDropdown from "./ProfileDropdown";
import { apiFetch } from '../lib/api';

export const Header = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    let canceled = false;
    const fetchNotificationCount = async () => {
      try {
        const data = await apiFetch(`${API_BASE}/request/my`, { showToast: false });
        if (!canceled && Array.isArray(data.requests)) {
          setNotificationCount(data.requests.length);
        }
      } catch (err) {
        if (!canceled) setNotificationCount(0);
      }
    };
    fetchNotificationCount();
    return () => {
      canceled = true;
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">MS ChitFund</h1>
            {user.isAdmin && (
              <div className="admin-badge">
                <Shield className="admin-icon" />
                Admin
              </div>
            )}
          </div>

          <div className="header-right">
            <button className="notification-btn" aria-label="View notifications">
              <Bell className="bell-icon" />
              {notificationCount > 0 && (
                <span className="notification-count">{notificationCount}</span>
              )}
            </button>

            <div
              className="user-info"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="user-icon" />
              <span className="user-name">{`${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`}</span>
            </div>

            {showProfile && <ProfileDropdown user={user} onLogout={onLogout} />}
          </div>
        </div>
      </div>
    </header>
  );
};