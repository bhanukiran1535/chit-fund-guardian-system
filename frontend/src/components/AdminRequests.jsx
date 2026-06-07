import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';
import { ConfirmDialog } from './ConfirmDialog';

const TYPE_LABEL = {
  join_group: 'Join Group',
  payment_confirmation: 'Payment',
  month_prebook: 'Payout Prebook',
  leave_group: 'Leave Group',
  confirm_cash_payment: 'Cash Confirm',
};

const TYPE_DOT = {
  join_group: 'bg-indigo-500',
  payment_confirmation: 'bg-emerald-500',
  month_prebook: 'bg-purple-500',
  leave_group: 'bg-red-500',
  confirm_cash_payment: 'bg-amber-500',
};

export const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupList, setGroupList] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState({});
  const [confirm, setConfirm] = useState(null);

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/request/pending`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setRequests(data.requests);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    const statuses = ['active', 'upcoming'];
    const results = await Promise.all(
      statuses.map(status =>
        fetch(`${import.meta.env.VITE_API_BASE_URL}/group/status/${status}`, { credentials: 'include' })
          .then(res => res.json())
      )
    );
    setGroupList(results.flatMap(r => (r.success ? r.groups : [])));
  };

  useEffect(() => { fetchPendingRequests(); }, []);
  useEffect(() => { fetchGroups(); }, []);

  const doApprove = async (requestId, type, groupId) => {
    const payload = { requestId };
    if (type === 'join_group') {
      const selectedGroupId = selectedGroups[requestId];
      if (!selectedGroupId) {
        toast.error('Please select a group before approving.');
        return;
      }
      payload.seclectedgroupId = selectedGroupId;
    }
    if (type === 'month_prebook') {
      if (!groupId) {
        toast.error('Month/group is not specified for this request.');
        return;
      }
      payload.groupId = groupId;
    }
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/request/approve`, {
        method: 'POST',
        body: payload,
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request approved successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to approve request.');
    }
  };

  const doReject = async (requestId) => {
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/request/reject`, {
        method: 'POST',
        body: { requestId },
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Request rejected.');
    } catch (err) {
      toast.error(err.message || 'Failed to reject request.');
    }
  };

  const handleApprove = (requestId, type, groupId) => {
    setConfirm({
      title: 'Approve Request',
      message: 'Are you sure you want to approve this request? This action cannot be undone.',
      confirmLabel: 'Approve',
      variant: 'info',
      onConfirm: () => { setConfirm(null); doApprove(requestId, type, groupId); },
    });
  };

  const handleReject = (requestId) => {
    setConfirm({
      title: 'Reject Request',
      message: 'Are you sure you want to reject this request? The member will be notified.',
      confirmLabel: 'Reject',
      variant: 'danger',
      onConfirm: () => { setConfirm(null); doReject(requestId); },
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] px-5 py-10 text-center text-[13px] text-gray-400">
        Loading requests…
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-gray-900">Pending Requests</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">Review and approve member requests across all groups</p>
          </div>
          {requests.length > 0 && (
            <span className="text-[11px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {requests.length}
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Clock className="mx-auto mb-3 opacity-30 text-gray-400" size={28} />
            <p className="text-[13px] text-gray-400">No pending requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Group</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Message</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-700">
                        <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${TYPE_DOT[request.type] || 'bg-gray-400'}`} />
                        {TYPE_LABEL[request.type] || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800">{request.user}</p>
                      <p className="text-[12px] text-gray-400">{request.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {request.type === 'join_group' ? (
                        <select
                          value={selectedGroups[request.id] || ''}
                          onChange={(e) => setSelectedGroups(prev => ({ ...prev, [request.id]: e.target.value }))}
                          className="text-[12px] border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Select Group</option>
                          {groupList.map((group) => (
                            <option key={group._id} value={group._id}>
                              {group.groupNo} — ₹{group.chitValue.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700">{request.groupId?.groupNo || '—'}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {request.amount
                        ? <span className="font-semibold text-gray-900">₹{request.amount.toLocaleString()}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3.5 max-w-[180px]">
                      <span className="text-gray-600 text-[12px] line-clamp-2">
                        {request.type === 'confirm_cash_payment' && request.monthName
                          ? `Cash payment for ${request.monthName}`
                          : request.message || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-[12px] whitespace-nowrap">
                      {new Date(request.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(request.id, request.type, request.groupId?._id || request.groupId)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-[12px] font-semibold rounded-md hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle size={12} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-red-600 text-[12px] font-semibold rounded-md hover:bg-red-50 transition-colors"
                        >
                          <XCircle size={12} />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
