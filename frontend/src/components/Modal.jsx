import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0E0E10] rounded-2xl border border-white/[0.12] p-6 z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-white/40 hover:text-white hover:bg-white/[0.08] rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
