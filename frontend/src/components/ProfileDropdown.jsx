import { useState } from 'react';
import { LogOut, Settings, Mail } from 'lucide-react';
import { AccountSettingsModal } from './AccountSettingsModal';

const ProfileDropdown = ({ user, onLogout }) => {
  const [showSettings, setShowSettings] = useState(false);

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  const displayName = `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;

  return (
    <>
      <div
        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-50 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-[11px] font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="py-1.5">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <Settings size={14} className="text-gray-400 shrink-0" />
            Account Settings
          </button>
        </div>

        <div className="py-1.5 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={14} className="shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      <AccountSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default ProfileDropdown;
