import { useEffect, useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toast } from './ui/sonner';

/**
 * Renders payment instructions for a (group, month) — ONLY if the current
 * user is in the instruction's visibleTo list. Otherwise renders nothing
 * (no "not published" placeholder, by product requirement).
 */
export const PaymentInstructionCard = ({ groupId, monthName }) => {
  const API = import.meta.env.VITE_API_BASE_URL;
  const [instr, setInstr] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!groupId || !monthName) return;
    (async () => {
      try {
        const data = await apiFetch(
          `${API}/payment-instruction/${groupId}/${encodeURIComponent(monthName)}`,
          { showToast: false }
        );
        if (!cancelled && data?.success) setInstr(data.instruction || null);
      } catch {
        if (!cancelled) setInstr(null);
      }
    })();
    return () => { cancelled = true; };
  }, [API, groupId, monthName]);

  if (!instr) return null;

  const copy = async (key, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1500);
      toast.success('Copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const Row = ({ label, value, copyKey }) => {
    if (!value) return null;
    return (
      <div className="flex items-center justify-between gap-3 py-1.5">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500/80">{label}</p>
          <p className="text-[13px] font-semibold text-gray-900 truncate">{value}</p>
        </div>
        {copyKey && (
          <button
            onClick={() => copy(copyKey, value)}
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-white border border-indigo-100 rounded-md px-2 py-1"
            type="button"
          >
            {copiedKey === copyKey ? <Check size={12} /> : <Copy size={12} />}
            {copiedKey === copyKey ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Info size={14} className="text-indigo-600" />
        <h4 className="text-[13px] font-semibold text-indigo-800">
          Payment instructions for {monthName}
        </h4>
      </div>
      <div className="divide-y divide-indigo-100/70">
        <Row label="Recipient" value={instr.recipientName} />
        <Row label="UPI ID" value={instr.upiId} copyKey="upi" />
        <Row label="Phone" value={instr.phone} copyKey="phone" />
        <Row label="Bank" value={instr.bankName} />
        <Row label="Account No." value={instr.accountNumber} copyKey="acc" />
        <Row label="IFSC" value={instr.ifsc} copyKey="ifsc" />
      </div>
      {instr.notes && (
        <p className="mt-2 text-[12px] text-gray-700 whitespace-pre-wrap border-t border-indigo-100/70 pt-2">
          {instr.notes}
        </p>
      )}
    </div>
  );
};
