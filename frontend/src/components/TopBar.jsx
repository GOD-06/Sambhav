import { Menu } from 'lucide-react';
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
    <header className="h-14 bg-black/80 backdrop-blur border-b border-white/[0.08] flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-white/50 hover:text-white hover:bg-white/[0.06] rounded-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs text-white/50">
          Signed in as <span className="font-medium text-white">{user?.email}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
          <div className="w-7 h-7 rounded-full bg-white/[0.08] text-[#E8FF1F] border border-white/[0.12] flex items-center justify-center text-xs font-semibold font-mono">
            {getInitials(user)}
          </div>
          <div className="hidden sm:block text-left leading-none">
            <span className="text-xs font-medium text-white block">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
            </span>
            <span className="text-[10px] text-white/40 capitalize font-mono mt-0.5 block">{user?.role || 'Customer'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
