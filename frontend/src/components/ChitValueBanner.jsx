import { useEffect, useState } from 'react';
import { Plus, X, ArrowRight, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from './ConfirmDialog';

const chitValues = [50000, 100000, 200000, 500000];

export const ChitValueBanner = () => {
  const [bannerGroups, setBannerGroups] = useState([]);
  const [filteredChits, setFilteredChits] = useState([]);
  const [pendingAmounts, setPendingAmounts] = useState([]);
  const [customAmountStr, setCustomAmountStr] = useState('');
  const [confirm, setConfirm] = useState(null);
  const API = import.meta.env.VITE_API_BASE_URL;

  const fetchData = async () => {
    try {
      const [groupsRes, requestsRes] = await Promise.all([
        fetch(`${API}/group/status/upcoming`, { credentials: 'include' }),
        fetch(`${API}/request/my`, { credentials: 'include' }),
      ]);
      const [groupsData, requestsData] = await Promise.all([groupsRes.json(), requestsRes.json()]);

      if (groupsData.success) {
        const upcomingGroups = groupsData.groups || [];

        // Promo banner groups (bannerEnabled, max 3)
        setBannerGroups(upcomingGroups.filter(g => g.bannerEnabled).slice(0, 3));

        // Basic section — map standard chit values to nearest upcoming group
        const filtered = chitValues
          .map(val => {
            const match = upcomingGroups
              .filter(g => g.chitValue >= val)
              .sort((a, b) => new Date(a.startMonth) - new Date(b.startMonth))[0];
            if (!match) return null;
            return {
              chitValue: val,
              tenure: match.tenure,
              startMonth: new Date(match.startMonth).toLocaleString('default', { month: 'long', year: 'numeric' }),
            };
          })
          .filter(Boolean);
        setFilteredChits(filtered);
      }

      if (requestsData.success) {
        const amounts = (requestsData.requests || [])
          .filter(r => r.type === 'join_group' && r.status === 'pending')
          .map(r => r.amount);
        setPendingAmounts(amounts);
      }
    } catch (err) {
      console.error('Error fetching chit data:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const requestToJoin = (amount) => {
    setConfirm({
      title: 'Request to Join',
      message: `Send a join request for a ₹${Number(amount).toLocaleString()} chit group? Your request will be reviewed by the admin.`,
      confirmLabel: 'Send Request',
      variant: 'info',
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await fetch(`${API}/request/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ amount }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(data.message || 'Request submitted successfully.');
            setPendingAmounts(prev => [...prev, amount]);
          } else {
            toast.error(data.message || 'Failed to submit request.');
          }
        } catch {
          toast.error('Error sending join request. Please try again.');
        }
      },
    });
  };

  const withdrawRequest = (amount) => {
    setConfirm({
      title: 'Withdraw Request',
      message: `Withdraw your join request for ₹${Number(amount).toLocaleString()}? You can submit a new request later.`,
      confirmLabel: 'Withdraw',
      variant: 'warning',
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await fetch(`${API}/request/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ amount, type: 'join_group' }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(data.message || 'Request withdrawn successfully.');
            setPendingAmounts(prev => prev.filter(a => a !== amount));
          } else {
            toast.error(data.message || 'Failed to withdraw request.');
          }
        } catch {
          toast.error('Error withdrawing request. Please try again.');
        }
      },
    });
  };

  const handleCustomRequest = () => {
    const amount = Number(customAmountStr);
    if (!amount || amount < 10000) {
      toast.error('Please enter a valid amount of ₹10,000 or more.');
      return;
    }
    requestToJoin(amount);
  };

  return (
    <>
      <div className="space-y-4">

        {/* ── Promotional banners (top, if any enabled) ──────────── */}
        {bannerGroups.length > 0 && (
          <div className="space-y-3">
            {bannerGroups.map((group) => {
              const isPending = pendingAmounts.includes(group.chitValue);
              const slotsRemaining = Math.max(0, group.tenure - (group.members?.length || 0));
              const startLabel = new Date(group.startMonth).toLocaleDateString('en-IN', {
                month: 'long', year: 'numeric',
              });
              return (
                <div
                  key={group._id}
                  className="relative overflow-hidden rounded-2xl border border-indigo-500/20"
                  style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #3730a3 100%)' }}
                >
                  <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

                  <div className="relative px-5 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                          <Sparkles size={10} />
                          Promotional Offer
                        </span>
                        {slotsRemaining > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                            <Users size={9} />
                            {slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''} left
                          </span>
                        )}
                        {slotsRemaining === 0 && (
                          <span className="text-[10px] font-bold text-red-300 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">Full</span>
                        )}
                      </div>
                      <p className="text-[26px] font-black text-white tracking-tight leading-none tabular-nums">
                        ₹{group.chitValue.toLocaleString()}
                      </p>
                      {group.bannerTagline && (
                        <p className="text-[13px] text-indigo-200 mt-1.5 leading-snug">{group.bannerTagline}</p>
                      )}
                      <p className="text-[12px] text-indigo-400 mt-1.5">
                        {group.tenure} months · Starts {startLabel}
                      </p>
                    </div>

                    <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                      {isPending ? (
                        <>
                          <div className="px-4 py-2.5 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-[12px] font-semibold rounded-xl text-center whitespace-nowrap">
                            ✓ Request Pending
                          </div>
                          <button
                            onClick={() => withdrawRequest(group.chitValue)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-red-300 text-[12px] font-semibold rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap"
                          >
                            <X size={11} />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => requestToJoin(group.chitValue)}
                          disabled={slotsRemaining === 0}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-900 text-[13px] font-bold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-[0_2px_12px_rgba(255,255,255,0.15)]"
                        >
                          Request to Join
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Standard chit value cards ─────────────────────────── */}
        {filteredChits.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Available to Join</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filteredChits.map(chit => {
                const isPending = pendingAmounts.includes(chit.chitValue);
                return (
                  <div
                    key={chit.chitValue}
                    className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-4 py-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Chit Value</p>
                    <p className="text-[22px] font-bold text-gray-900 tabular-nums">₹{chit.chitValue.toLocaleString()}</p>
                    <p className="text-[12px] text-gray-500 mt-1">{chit.tenure} months · Starts {chit.startMonth}</p>
                    {isPending ? (
                      <button
                        onClick={() => withdrawRequest(chit.chitValue)}
                        className="mt-3 w-full py-1.5 bg-red-50 border border-red-200 text-red-600 text-[12px] font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X size={11} />
                        Withdraw
                      </button>
                    ) : (
                      <button
                        onClick={() => requestToJoin(chit.chitValue)}
                        className="mt-3 w-full py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ArrowRight size={11} />
                        Request to Join
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Custom amount ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-4 py-4">
          <p className="text-[12px] font-semibold text-gray-700 mb-2">Request a custom chit amount</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[13px]">₹</span>
              <input
                type="number"
                placeholder="10,000 or more"
                value={customAmountStr}
                onChange={e => setCustomAmountStr(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCustomRequest()}
                className="w-full pl-7 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                min="10000"
              />
            </div>
            <button
              onClick={handleCustomRequest}
              className="px-3 py-2 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              <Plus size={13} />
              Request
            </button>
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        variant={confirm?.variant}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
};
