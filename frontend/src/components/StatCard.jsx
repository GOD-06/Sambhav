export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const iconColorMap = {
    blue: 'text-[#A9B2FF] bg-[#A9B2FF]/10 border-[#A9B2FF]/20',
    green: 'text-[#E8FF1F] bg-[#E8FF1F]/10 border-[#E8FF1F]/20',
    amber: 'text-[#FFB37A] bg-[#FFB37A]/10 border-[#FFB37A]/20',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const badgeStyle = iconColorMap[color] || iconColorMap.blue;

  return (
    <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5 hover:border-white/[0.16] transition">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${badgeStyle}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-2xl font-light text-white font-mono tracking-tight">{value}</span>
      </div>
    </div>
  );
}
