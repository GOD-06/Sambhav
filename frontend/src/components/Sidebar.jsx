import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  FileText,
  Receipt,
  CreditCard,
  Percent,
  UserCog,
  Settings,
  LogOut,
  X,
  Repeat,
  FileBarChart,
  User,
  Zap,
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/packages', icon: Zap, label: 'Subscribe Packages' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/plans', icon: ClipboardList, label: 'Plans' },
  { to: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
  { to: '/quotations', icon: FileBarChart, label: 'Quotations' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/discounts', icon: Percent, label: 'Discounts' },
  { to: '/tax-rules', icon: Receipt, label: 'Tax Rules' },
  { to: '/staff', icon: UserCog, label: 'Staff' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const staffLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/packages', icon: Zap, label: 'Subscribe Packages' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/plans', icon: ClipboardList, label: 'Plans' },
  { to: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
  { to: '/quotations', icon: FileBarChart, label: 'Quotations' },
  { to: '/invoices', icon: FileText, label: 'Invoices' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const customerLinks = [
  { to: '/packages', icon: Zap, label: 'Subscribe Packages' },
  { to: '/my-subscriptions', icon: Repeat, label: 'My Subscriptions' },
  { to: '/my-invoices', icon: FileText, label: 'My Invoices' },
  { to: '/my-payments', icon: CreditCard, label: 'My Payments' },
  { to: '/settings', icon: User, label: 'Profile' },
];

export default function Sidebar({ onClose }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : customerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (user) => {
    if (!user) return '?';
    const first = user.first_name?.[0] || user.email?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <div className="flex flex-col h-full w-64 bg-black text-white border-r border-white/[0.08]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E8FF1F] text-black flex items-center justify-center font-bold text-xs tracking-tight shadow-sm font-mono">
            SM
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block leading-tight">Subscription</span>
            <span className="text-[11px] text-white/50 block font-mono">Management System</span>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded">
          <X className="w-5 h-5 text-white/50" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold tracking-tight transition ${
                  isActive
                    ? 'bg-white text-black font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Info */}
      <div className="border-t border-white/[0.08] p-3 bg-white/[0.02]">
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-xs font-bold font-mono">
            {getInitials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">{user?.role || 'Customer'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-white/40 hover:text-[#E8FF1F] hover:bg-white/10 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
