
import { Bell, LogOut, Shield, User } from 'lucide-react';
import './Header.css';
<<<<<<< HEAD:src/components/Header.jsx

export const Header = ({ user, onLogout }) => {
=======
import { useState } from 'react';
import ProfileDropdown from "./ProfileDropdown";

export const Header = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/Header.jsx
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">ChitFund Guardian</h1>
            {user.isAdmin && (
              <div className="admin-badge">
                <Shield className="admin-icon" />
                Admin
              </div>
            )}
          </div>
<<<<<<< HEAD:src/components/Header.jsx
          
=======

>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/Header.jsx
          <div className="header-right">
            <button className="notification-btn">
              <Bell className="bell-icon" />
              <span className="notification-count">3</span>
            </button>
<<<<<<< HEAD:src/components/Header.jsx
            
            <div className="user-info">
              <User className="user-icon" />
              <span className="user-name">{user.alias}</span>
            </div>
            
            <button className="logout-btn" onClick={onLogout}>
              <LogOut className="logout-icon" />
              Logout
            </button>
=======

            <div
              className="user-info"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="user-icon" />
              <span className="user-name">{user.alias}</span>
            </div>

            {showProfile && <ProfileDropdown user={user} onLogout={onLogout} />}
>>>>>>> 1a4d7b7 (loveable check):frontend/src/components/Header.jsx
          </div>
        </div>
      </div>
    </header>
  );
};
