import { LogOut, User as UserIcon, Settings } from "lucide-react";
import "./ProfileDropdown.css";

const ProfileDropdown = ({ user, onLogout }) => {
  return (
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
        <button className="profile-button logout" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
