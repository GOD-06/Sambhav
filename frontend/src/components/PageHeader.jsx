export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.08]">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {description && <p className="text-xs text-white/50 mt-0.5">{description}</p>}
      </div>
      {action && (
        <div>
          <button
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {action.icon && <action.icon className="w-3.5 h-3.5 text-black" />}
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
