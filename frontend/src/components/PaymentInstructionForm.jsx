import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toast } from './ui/sonner';

/**
 * Admin modal to create/update payment instructions for one (group, month).
 * Includes per-member visibility selection.
 */
export const PaymentInstructionForm = ({ groupId, monthName, onClose, onSaved }) => {
  const API = import.meta.env.VITE_API_BASE_URL;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    recipientName: '', upiId: '', bankName: '', accountNumber: '',
    ifsc: '', phone: '', notes: '', visibleTo: [],
  });
  const [exists, setExists] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch(
          `${API}/payment-instruction/admin/${groupId}/${encodeURIComponent(monthName)}`,
          { showToast: false }
        );
        if (cancelled || !data?.success) return;
        setMembers(data.members || []);
        if (data.instruction) {
          setExists(true);
          setForm({
            recipientName: data.instruction.recipientName || '',
            upiId: data.instruction.upiId || '',
            bankName: data.instruction.bankName || '',
            accountNumber: data.instruction.accountNumber || '',
            ifsc: data.instruction.ifsc || '',
            phone: data.instruction.phone || '',
            notes: data.instruction.notes || '',
            visibleTo: (data.instruction.visibleTo || []).map(String),
          });
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [API, groupId, monthName]);

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(id)
        ? prev.visibleTo.filter(m => m !== id)
        : [...prev.visibleTo, id],
    }));
  };

  const selectAll = () => setForm(prev => ({ ...prev, visibleTo: members.map(m => String(m._id)) }));
  const clearAll = () => setForm(prev => ({ ...prev, visibleTo: [] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch(
        `${API}/payment-instruction/${groupId}/${encodeURIComponent(monthName)}`,
        { method: 'PUT', body: form }
      );
      onSaved?.();
      onClose?.();
    } catch {
      // toast already shown by apiFetch
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!exists) return;
    if (!window.confirm('Remove payment instruction for this month?')) return;
    setSaving(true);
    try {
      await apiFetch(
        `${API}/payment-instruction/${groupId}/${encodeURIComponent(monthName)}`,
        { method: 'DELETE' }
      );
      onSaved?.();
      onClose?.();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, placeholder = '') => (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">{label}</label>
      <input
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Payment Instructions</h3>
            <p className="text-[12px] text-gray-400">{monthName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-[13px] text-gray-400">Loading…</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {field('Recipient Name', 'recipientName', 'e.g. Ravi Kumar')}
                {field('Phone', 'phone', '+91…')}
                {field('UPI ID', 'upiId', 'name@upi')}
                {field('Bank Name', 'bankName', 'HDFC Bank')}
                {field('Account Number', 'accountNumber')}
                {field('IFSC', 'ifsc')}
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">Additional Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any extra instructions for the member…"
                  className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-[13px] font-semibold text-gray-900">Visible to members</h4>
                    <p className="text-[11px] text-gray-400">Only selected members will see these instructions.</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={selectAll} className="text-[11px] font-semibold text-indigo-600 hover:underline">All</button>
                    <span className="text-gray-300">·</span>
                    <button type="button" onClick={clearAll} className="text-[11px] font-semibold text-gray-500 hover:underline">None</button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                  {members.length === 0 && (
                    <p className="px-3 py-4 text-[12px] text-gray-400 text-center">No active members.</p>
                  )}
                  {members.map(m => {
                    const id = String(m._id);
                    const checked = form.visibleTo.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMember(id)}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800 truncate">
                            {m.firstName} {m.lastName || ''}
                          </p>
                          {m.email && <p className="text-[11px] text-gray-400 truncate">{m.email}</p>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
          {exists ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
            >
              <Trash2 size={13} /> Remove
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
