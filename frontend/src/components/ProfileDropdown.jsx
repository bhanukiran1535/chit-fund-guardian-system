import { LogOut, User as UserIcon, Settings, Key } from "lucide-react";
import { useState } from 'react';
import "./ProfileDropdown.css";
import { ChangePasswordModal } from './ChangePasswordModal';

const ProfileDropdown = ({ user, onLogout }) => {
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
      <div className="profile-dropdown">
        <div className="profile-header">
          <UserIcon className="profile-icon" />
          <div className="profile-details">
            <p className="profile-alias">{user.alias}</p>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
        <div className="profile-actions">
          <button className="profile-button">
            <Settings size={16} />
            Settings
          </button>
          <button 
            className="profile-button" 
            onClick={() => setShowChangePassword(true)}
          >
            <Key size={16} />
            Change Password
          </button>
          <button className="profile-button logout" onClick={onLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />
    </>
  );
};

export default ProfileDropdown;
