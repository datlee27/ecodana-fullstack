import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../design-system';

type AdminSidebarScope = 'admin' | 'staff';

interface AdminSidebarProps {
  scope: AdminSidebarScope;
}

interface NavItem {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
}

const adminNavItems: NavItem[] = [
  { to: '/admin',           icon: 'dashboard',         label: 'Tổng quan',  end: true },
  { to: '/admin/users',     icon: 'group',             label: 'Người dùng'  },
  { to: '/admin/vehicles',  icon: 'electric_scooter',  label: 'Phương tiện' },
  { to: '/admin/bookings',  icon: 'receipt_long',      label: 'Đơn đặt xe' },
  { to: '/admin/payments',  icon: 'payments',          label: 'Thanh toán'  },
  { to: '/admin/refunds',   icon: 'assignment_return', label: 'Hoàn tiền'   },
  { to: '/admin/contracts', icon: 'description',       label: 'Hợp đồng'   },
  { to: '/admin/discounts', icon: 'local_offer',       label: 'Ưu đãi'     },
];

const staffNavItems: NavItem[] = [
  { to: '/staff',                   icon: 'dashboard',    label: 'Tổng quan',  end: true },
  { to: '/staff/vehicle-approvals', icon: 'verified',     label: 'Duyệt xe'   },
  { to: '/staff/bookings',          icon: 'receipt_long', label: 'Đơn đặt xe' },
  { to: '/staff/operations',        icon: 'monitoring',   label: 'Điều phối'  },
  { to: '/staff/users',             icon: 'group',        label: 'Người dùng' },
];

const adminBottomItems: NavItem[] = [{ to: '/admin/settings', icon: 'settings', label: 'Cài đặt' }];
const staffBottomItems: NavItem[] = [{ to: '/staff/settings', icon: 'settings', label: 'Cài đặt' }];

const SidebarLink = ({ item }: { item: NavItem }) => (
  <NavLink
    to={item.to}
    end={item.end}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
        isActive
          ? 'border-l-4 border-eco-green bg-eco-green-soft pl-7 text-eco-green'
          : 'rounded-lg text-text-base hover:bg-muted-surface',
      )
    }
  >
    {({ isActive }) => (
      <>
        <span
          className="material-symbols-outlined text-[20px] leading-none"
          style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
          aria-hidden="true"
        >
          {item.icon}
        </span>
        <span>{item.label}</span>
      </>
    )}
  </NavLink>
);

export const AdminSidebar = ({ scope }: AdminSidebarProps) => {
  const isAdmin    = scope === 'admin';
  const navItems   = isAdmin ? adminNavItems   : staffNavItems;
  const btmItems   = isAdmin ? adminBottomItems : staffBottomItems;
  const brandTitle = isAdmin ? 'EcoDana Admin' : 'EcoDana Staff';
  const brandSub   = isAdmin ? 'Bảng điều hành hệ thống' : 'Nghiệp vụ vận hành';

  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-color bg-white"
      data-shell-zone="sidebar"
    >
      {/* Brand */}
      <div className="shrink-0 border-b border-border-color p-6">
        <h1 className="font-headline text-xl font-bold tracking-tight text-eco-green">
          {brandTitle}
        </h1>
        <p className="mt-0.5 text-xs text-text-muted">{brandSub}</p>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 space-y-1 overflow-y-auto px-4 py-6"
        data-shell-zone="sidebar-nav"
      >
        {navItems.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      {/* Bottom zone */}
      <div
        className="mt-auto space-y-1 border-t border-border-color p-4"
        data-shell-zone="sidebar-bottom"
      >
        {btmItems.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}

        {/* Logout is a button — never a NavLink */}
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-text-base transition-colors hover:bg-muted-surface"
        >
          <span className="material-symbols-outlined text-[20px] leading-none" aria-hidden="true">
            logout
          </span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
