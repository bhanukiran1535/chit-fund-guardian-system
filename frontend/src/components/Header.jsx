import { Bell, LogOut, Shield, User } from 'lucide-react';
import './Header.css';
import { useState } from 'react';
import ProfileDropdown from "./ProfileDropdown";

export const Header = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
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
            <button className="notification-btn">
              <Bell className="bell-icon" />
              <span className="notification-count">3</span>
            </button>

            <div
              className="user-info"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="user-icon" />
              <span className="user-name">{user.alias}</span>
            </div>

            {showProfile && <ProfileDropdown user={user} onLogout={onLogout} />}
          </div>
        </div>
      </div>
    </header>
  );
};