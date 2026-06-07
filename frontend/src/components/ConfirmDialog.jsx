import { AlertTriangle, Info } from 'lucide-react';

/**
 * Reusable confirmation dialog — replaces all window.confirm / alert calls.
 * Props:
 *   isOpen          boolean  — controls visibility
 *   title           string   — modal heading
 *   message         string   — body text
 *   confirmLabel    string   — primary button label (default "Confirm")
 *   cancelLabel     string   — secondary button label (default "Cancel")
 *   variant         'danger' | 'warning' | 'info'  (default 'danger')
 *   onConfirm       () => void
 *   onCancel        () => void
 */
export const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const iconColor = {
    danger:  'text-red-500',
    warning: 'text-amber-500',
    info:    'text-indigo-500',
  }[variant] || 'text-red-500';

  const iconBg = {
    danger:  'bg-red-50',
    warning: 'bg-amber-50',
    info:    'bg-indigo-50',
  }[variant] || 'bg-red-50';

  const primaryColor = {
    danger:  'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-600 hover:bg-amber-700',
    info:    'bg-indigo-600 hover:bg-indigo-700',
  }[variant] || 'bg-red-600 hover:bg-red-700';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      onClick={onCancel}
    >
      <div
        className="bg-white w-full rounded-t-2xl sm:rounded-2xl border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.16)] sm:max-w-sm sm:mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
            {variant === 'info'
              ? <Info size={18} className={iconColor} />
              : <AlertTriangle size={18} className={iconColor} />}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
            {message && <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">{message}</p>}
          </div>
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-3 sm:py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] sm:text-[13px] font-semibold rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 sm:py-2.5 text-white text-[14px] sm:text-[13px] font-semibold rounded-lg transition-colors min-h-[44px] ${primaryColor}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
