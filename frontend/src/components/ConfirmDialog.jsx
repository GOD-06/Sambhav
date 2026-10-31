import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) {
  const variantClasses = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-start gap-4 py-2">
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <p className="text-xs text-white/70 leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 text-xs font-medium text-white/70 bg-white/[0.06] border border-white/[0.12] rounded-lg hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${variantClasses[variant]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
