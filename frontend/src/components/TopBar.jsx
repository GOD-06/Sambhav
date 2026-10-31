import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();

  const getInitials = (user) => {
    if (!user) return '?';
    const first = user.first_name?.[0] || user.email?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm text-slate-600">
          Signed in as <span className="font-semibold text-slate-900">{user?.email}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-xs font-semibold">
            {getInitials(user)}
          </div>
          <div className="hidden sm:block text-left leading-none">
            <span className="text-xs font-medium text-slate-800 block">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
            </span>
            <span className="text-[10px] text-slate-400 capitalize">{user?.role || 'Customer'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
