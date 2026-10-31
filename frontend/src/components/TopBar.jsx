import { Menu, Bell, User } from 'lucide-react';
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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block text-sm text-gray-500">
          Welcome back, <span className="font-semibold text-gray-800">{user?.first_name || user?.email}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
            {getInitials(user)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700 leading-none">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
            </p>
            <p className="text-xs text-gray-400 capitalize mt-1">{user?.role || 'Customer'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
