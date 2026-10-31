import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', message = 'There are no items to display.', icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-white/40" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-white/50 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
