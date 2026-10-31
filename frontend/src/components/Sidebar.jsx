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
  Tag,
  Percent,
  UserCog,
  Settings,
  LogOut,
  X,
  Repeat,
  ShoppingBag,
  FileBarChart,
  User,
  Zap,
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
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
  { to: '/settings', icon: User, label: 'My Profile' },
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
    <div className="flex flex-col h-full w-64 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Brightloop</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-800 rounded">
          <X className="w-5 h-5" />
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User info */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
            {getInitials(user)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
