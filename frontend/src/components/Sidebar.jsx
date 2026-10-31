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
  Wallet,
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/finance-bento', icon: Wallet, label: 'Finance Bento' },
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
    <div className="flex flex-col h-full w-64 bg-slate-900 text-slate-100 border-r border-slate-800">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-700 rounded flex items-center justify-center font-bold text-sm text-white">
            B
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">Brightloop</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-800 rounded">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <div className="space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded text-slate-200 flex items-center justify-center text-xs font-semibold">
            {getInitials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
            </p>
            <p className="text-[11px] text-slate-400 capitalize">{user?.role || 'Customer'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
