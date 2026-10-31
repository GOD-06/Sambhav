export default function StatusBadge({ status }) {
  const getBadgeStyle = (val) => {
    switch (val?.toLowerCase()) {
      case 'active':
      case 'paid':
      case 'accepted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'confirmed':
      case 'sent':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'paused':
      case 'overdue':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'closed':
      case 'cancelled':
      case 'rejected':
      case 'expired':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'draft':
      case 'quotation':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${getBadgeStyle(
        status
      )}`}
    >
      {status || 'Unknown'}
    </span>
  );
}
