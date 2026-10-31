export default function StatusBadge({ status }) {
  const getBadgeStyle = (val) => {
    switch (val?.toLowerCase()) {
      case 'active':
      case 'paid':
      case 'accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'confirmed':
      case 'sent':
        return 'bg-[#A9B2FF]/10 text-[#A9B2FF] border-[#A9B2FF]/30';
      case 'paused':
      case 'overdue':
        return 'bg-[#FFB37A]/10 text-[#FFB37A] border-[#FFB37A]/30';
      case 'closed':
      case 'cancelled':
      case 'rejected':
      case 'expired':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'draft':
      case 'quotation':
      default:
        return 'bg-white/[0.06] text-white/60 border-white/[0.12]';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize font-mono ${getBadgeStyle(
        status
      )}`}
    >
      {status || 'Unknown'}
    </span>
  );
}
