import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, CheckCircle, Shield } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const LabeledField = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-semibold text-gray-500">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 text-[14px] sm:text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
  />
);

const Toggle = ({ label, description, ...props }) => (
  <label className="flex items-start justify-between gap-4 cursor-pointer">
    <div>
      <p className="text-[13px] font-semibold text-gray-800">{label}</p>
      {description && <p className="text-[12px] text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="relative shrink-0 mt-0.5">
      <input type="checkbox" className="sr-only peer" {...props} />
      <div className="w-9 h-5 bg-gray-200 peer-checked:bg-indigo-600 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-indigo-500/30" />
      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
    </div>
  </label>
);

const SectionDivider = ({ children }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="flex-1 h-px bg-gray-100" />
    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{children}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

export const AccountSettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { notificationPreferences: { emailUpdates: true, appAlerts: true } }
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({ notificationPreferences: { emailUpdates: user.notificationPreferences?.emailUpdates ?? true, appAlerts: user.notificationPreferences?.appAlerts ?? true } });
      setNotificationSuccess(''); setNotificationError(''); setPasswordError(''); setPasswordSuccess('');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [isOpen, reset, user]);

  const handleClose = () => {
    onClose();
    setNotificationSuccess(''); setNotificationError(''); setPasswordError(''); setPasswordSuccess('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const onSaveNotifications = async (formData) => {
    setIsSaving(true); setNotificationSuccess(''); setNotificationError('');
    try {
      const data = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/settings`, {
        method: 'PUT',
        body: { notificationPreferences: formData.notificationPreferences },
      });
      updateUser(data.user);
      setNotificationSuccess('Notification settings updated.');
    } catch (err) {
      setNotificationError(err.message || 'Unable to update notification preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('All fields are required.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match.'); return; }
    if (newPassword.length < 6) { setPasswordError('New password must be at least 6 characters.'); return; }
    setPasswordLoading(true);
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/change-password`, {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      setPasswordSuccess('Password changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Unable to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayName = `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={handleClose}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div
        className="relative bg-white w-full rounded-t-2xl sm:rounded-2xl border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.14)] sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-[13px] font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-gray-900">{displayName}</h2>
              <p className="text-[12px] text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={handleClose} className="h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-5">
          {/* Read-only profile info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledField label="Full Name">
              <Input type="text" value={displayName} disabled />
            </LabeledField>
            <LabeledField label="Email Address">
              <Input type="email" value={user.email || ''} disabled />
            </LabeledField>
          </div>

          <SectionDivider>Notifications</SectionDivider>

          <form onSubmit={handleSubmit(onSaveNotifications)} className="space-y-4">
            <div className="space-y-3">
              <Toggle label="Email updates" description="Receive email summaries and reminders." {...register('notificationPreferences.emailUpdates')} />
              <Toggle label="App alerts" description="Show activity and payment alerts in the dashboard." {...register('notificationPreferences.appAlerts')} />
            </div>

            {notificationError && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{notificationError}</p>}
            {notificationSuccess && <p className="text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-1.5"><CheckCircle size={13} />{notificationSuccess}</p>}

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 min-h-[44px]"
            >
              <CheckCircle size={13} />
              {isSaving ? 'Saving…' : 'Save preferences'}
            </button>
          </form>

          <SectionDivider>Change Password</SectionDivider>

          <form className="space-y-4" onSubmit={handlePasswordChange} noValidate>
            <div className="space-y-3">
              <LabeledField label="Current Password">
                <Input type="password" placeholder="••••••••" value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} />
              </LabeledField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LabeledField label="New Password">
                  <Input type="password" placeholder="••••••••" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} />
                </LabeledField>
                <LabeledField label="Confirm Password">
                  <Input type="password" placeholder="••••••••" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} />
                </LabeledField>
              </div>
            </div>

            {passwordError && <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>}
            {passwordSuccess && <p className="text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg flex items-center gap-1.5"><CheckCircle size={13} />{passwordSuccess}</p>}

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 min-h-[44px]"
            >
              <Shield size={13} />
              {passwordLoading ? 'Updating…' : 'Change password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
