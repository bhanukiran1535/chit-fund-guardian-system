import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

const TYPE_LABEL = {
  join_group: 'Join Group',
  leave_group: 'Leave Group',
  confirm_cash_payment: 'Cash Payment',
  month_prebook: 'Payout Prebook',
  payment_confirmation: 'Payment',
};

const STATUS_STYLE = {
  pending:  { dot: 'bg-amber-400',   text: 'text-amber-700',   border: 'border-l-amber-400'  },
  approved: { dot: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-l-emerald-500' },
  rejected: { dot: 'bg-red-400',     text: 'text-red-700',     border: 'border-l-red-400'    },
};

const formatTimestamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const isRecent = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() <= 48 * 60 * 60 * 1000;
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
      } catch { setNotifications([]); }
      finally { setLoading(false); }
    };
    fetchNotifications();
  }, [API_BASE]);

  const sortedNotifications = useMemo(() =>
    [...notifications]
      .map(n => ({ ...n, timestamp: new Date(n.timestamp || n.createdAt || Date.now()).toISOString() }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [notifications]
  );

  const latestNotifications = useMemo(() => sortedNotifications.filter(n => isRecent(n.timestamp)), [sortedNotifications]);
  const earlierNotifications = useMemo(() => sortedNotifications.filter(n => !isRecent(n.timestamp)), [sortedNotifications]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-10 text-center text-[13px] text-gray-400">
        Loading notifications…
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-12 text-center text-[13px] text-gray-400">
        No notifications yet.
      </div>
    );
  }

  const renderRow = (notif) => {
    const st = STATUS_STYLE[notif.status] || STATUS_STYLE.pending;
    const isNew = isRecent(notif.timestamp);
    return (
      <div
        key={notif._id}
        className={`flex items-start gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition-colors border-l-[3px] ${isNew ? st.border : 'border-l-transparent'}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold text-gray-800 capitalize">
              {TYPE_LABEL[notif.type] || notif.type?.replace(/_/g, ' ')}
            </p>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold shrink-0 ${st.text}`}>
              <span className={`w-[6px] h-[6px] rounded-full ${st.dot}`} />
              {notif.status?.charAt(0).toUpperCase() + notif.status?.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-400 flex-wrap">
            {notif.amount && <span>₹{notif.amount.toLocaleString()}</span>}
            {notif.monthName && <span>· {notif.monthName}</span>}
            <span>· {formatTimestamp(notif.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, count, children }) => (
    <div>
      <div className="px-5 py-2.5 flex items-center justify-between border-b border-gray-100 bg-gray-50/60">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        <span className="text-[11px] font-bold text-gray-500">{count}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="text-[14px] font-semibold text-gray-900">Notifications</h3>
        <p className="text-[12px] text-gray-400 mt-0.5">Latest updates about your requests and payments</p>
      </div>
      {latestNotifications.length > 0 && (
        <Section title="New · last 48h" count={latestNotifications.length}>
          {latestNotifications.map(renderRow)}
        </Section>
      )}
      {earlierNotifications.length > 0 && (
        <Section title="Earlier" count={earlierNotifications.length}>
          {earlierNotifications.map(renderRow)}
        </Section>
      )}
    </div>
  );
};
