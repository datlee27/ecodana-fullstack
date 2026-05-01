import {
  BarChart3,
  Car,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Settings,
  Star,
  University,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../design-system';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}

const ownerNavItems: NavItem[] = [
  { to: '/owner/dashboard',     icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/owner/vehicles',      icon: Car,             label: 'Phương tiện' },
  { to: '/owner/bookings',      icon: ClipboardList,   label: 'Đơn đặt xe' },
  { to: '/owner/payments',      icon: CreditCard,      label: 'Thanh toán' },
  { to: '/owner/feedback',      icon: Star,            label: 'Đánh giá' },
  { to: '/owner/bank-accounts', icon: University,      label: 'Tài khoản nhận tiền' },
];

const bottomNavItems: NavItem[] = [
  { to: '/owner/settings', icon: Settings, label: 'Cài đặt' },
];

const SidebarLink = ({ item, muted = false }: { item: NavItem; muted?: boolean }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to.split('/').length <= 2}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-soft text-primary before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full before:bg-primary'
            : muted
              ? 'text-text-muted hover:bg-muted hover:text-text-strong'
              : 'text-text-base hover:bg-muted hover:text-text-strong',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
};

export const OwnerSidebar = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="flex h-full flex-col border-r border-border bg-surface">
      {/* Brand lockup */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BarChart3 className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-strong">EcoDana</p>
          <p className="truncate text-xs text-text-muted">Quản lý phương tiện</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-0.5" role="list">
          {ownerNavItems.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom zone */}
      <div className="border-t border-border px-2 py-3">
        <ul className="space-y-0.5" role="list">
          {bottomNavItems.map((item) => (
            <li key={item.label}>
              <SidebarLink item={item} muted />
            </li>
          ))}
          {/* Logout — button, not NavLink */}
          <li>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-muted hover:text-text-strong"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Đăng xuất</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};
