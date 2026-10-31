export default function FormField({ label, required, help, children }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-white/70 mb-1.5">
          {label} {required && <span className="text-[#FFB37A]">*</span>}
        </label>
      )}
      {children}
      {help && <p className="text-[11px] text-white/40 mt-1">{help}</p>}
    </div>
  );
}
