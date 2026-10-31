export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const iconColorMap = {
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
    green: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-700 bg-amber-50 border-amber-200',
    red: 'text-rose-700 bg-rose-50 border-rose-200',
  };

  const badgeStyle = iconColorMap[color] || iconColorMap.blue;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded border flex items-center justify-center ${badgeStyle}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
      </div>
    </div>
  );
}
