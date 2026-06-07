import { useNavigate } from 'react-router-dom';

const STATUS = {
  upcoming:  { dot: 'bg-gray-300',    label: 'Upcoming',  text: 'text-gray-500'    },
  pending:   { dot: 'bg-amber-400',   label: 'Pending',   text: 'text-amber-700'   },
  paid:      { dot: 'bg-emerald-500', label: 'Paid',      text: 'text-emerald-700' },
  due:       { dot: 'bg-red-500',     label: 'Due Now',   text: 'text-red-700'     },
  completed: { dot: 'bg-indigo-400',  label: 'Completed', text: 'text-indigo-600'  },
};

const CompletedRibbon = () => (
  <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none z-10">
    <div
      className="absolute top-[18px] right-[-34px] w-[140px] text-center bg-emerald-600 text-white text-[10px] font-bold tracking-[0.18em] uppercase py-1 shadow-sm"
      style={{ transform: 'rotate(45deg)' }}
    >
      Completed
    </div>
  </div>
);

export const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  const getGroupStatus = () => {
    if (group.groupStatus === 'completed' || group.status === 'completed') return 'completed';
    return group.groupStatus || 'active';
  };

  const groupStatus = getGroupStatus();
  const isCompleted = groupStatus === 'completed';
  const payStatus = isCompleted ? 'completed' : (group.myPaymentStatus || 'upcoming');
  const s = STATUS[payStatus] || STATUS.upcoming;

  const progressValue = Math.min(group.currentMonth || 0, group.tenure || 0);
  const progressPct = group.tenure ? Math.round((progressValue / group.tenure) * 100) : 0;

  const startMonth = group.startMonth
    ? new Date(group.startMonth).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—';

  const monthlyShare = group.shareAmount && group.tenure
    ? Math.round(group.shareAmount / group.tenure)
    : 0;

  const handleClick = () => {
    navigate(`/user/group/${group._id}/details`, { state: { group } });
  };

  return (
    <div
      className={`bg-white rounded-xl border flex flex-col transition-shadow relative overflow-hidden
        ${isCompleted
          ? 'border-gray-200/60 shadow-none grayscale opacity-70 hover:opacity-90 hover:grayscale-0 transition-all duration-300'
          : 'border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
        }`}
    >
      {/* COMPLETED stamp overlay */}
      {isCompleted && <CompletedStamp id={group._id || group.groupNo} />}

      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Group No.</p>
            <p className="text-[22px] font-bold text-gray-900 leading-none">{group.groupNo}</p>
            <p className="text-[11px] text-gray-400 mt-1">Started {startMonth}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${s.text}`}>
            <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${s.dot}`} />
            {s.label}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 flex-1 space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Chit Value</p>
            <p className="text-[14px] font-semibold text-gray-900">₹{(group.shareAmount || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Monthly Share</p>
            <p className="text-[14px] font-semibold text-gray-900">₹{monthlyShare.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Tenure</p>
            <p className="text-[14px] font-semibold text-gray-900">{group.tenure} months</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">Payout Month</p>
            <p className="text-[14px] font-semibold text-gray-900">
              {group.preBookedMonth || (isCompleted ? 'Last Month' : '—')}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-gray-400">Progress</span>
            <span className={`font-semibold ${isCompleted ? 'text-gray-400' : 'text-indigo-600'}`}>
              {progressValue}/{group.tenure}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isCompleted ? 'bg-gray-400' : 'bg-indigo-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={handleClick}
          className={`w-full py-2.5 sm:py-2 rounded-lg text-[14px] sm:text-[13px] font-semibold transition-colors min-h-[44px] ${
            isCompleted
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : payStatus === 'due' || payStatus === 'pending'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isCompleted ? 'View Details' : (payStatus === 'due' || payStatus === 'pending') ? 'Pay Now' : 'View Details'}
        </button>
      </div>
    </div>
  );
};
