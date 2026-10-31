export default function FormField({ label, required, help, children }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}
      {children}
      {help && <p className="text-[11px] text-slate-400 mt-1">{help}</p>}
    </div>
  );
}
