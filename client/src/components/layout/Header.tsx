import { BatteryCharging, BookOpenCheck, Heart, LayoutDashboard, Leaf, LogIn, LogOut, Menu, User, UserPlus, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Button, cn } from '../../design-system';
import { useAuth } from '../../hooks/useAuth';
import { getRoleHomePath } from '../../utils/role';

const navItems = [
  { to: '/', label: 'Trang chủ' },
  { to: '/vehicles', label: 'Tìm xe' },
  { to: '/booking/my-bookings', label: 'Đơn đặt xe', authTarget: '/login' },
  { to: '/favorites', label: 'Yêu thích', requiresAuth: true },
  { to: '/register-car-info', label: 'Đăng ký chủ xe' },
];

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const dashboardPath = getRoleHomePath(user);

  const renderNavLink = (item: (typeof navItems)[number], mobile = false) => {
    if (item.requiresAuth && !isAuthenticated) return null;
    const target = item.authTarget && !isAuthenticated ? item.authTarget : item.to;

    return (
      <NavLink
        key={item.to}
        to={target}
        onClick={() => mobile && setMobileOpen(false)}
        className={({ isActive }) =>
          cn(
            mobile
              ? 'block rounded-lg px-3 py-2 text-sm font-semibold'
              : 'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
            isActive && target === item.to
              ? 'bg-primary-soft text-primary'
              : 'text-text-base hover:bg-muted hover:text-primary',
          )
        }
      >
        {item.label}
      </NavLink>
    );
  };

  return (
    <header id="main-nav" className="fixed left-0 top-0 z-50 w-full border-b border-border bg-surface/95 shadow-sm backdrop-blur nav-font-poppins">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold text-primary">EcoDana</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
            {navItems.map((item) => renderNavLink(item))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Đăng nhập
                </Link>
                <Link to="/register" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Đăng ký
                </Link>
              </>
            ) : (
              <div id="userMenu" className="group relative">
                <button type="button" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-text-base transition-colors hover:bg-muted hover:text-primary">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                    <User className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="max-w-32 truncate text-sm font-semibold">{user?.firstName || user?.username || 'Tài khoản'}</span>
                </button>

                <div className="invisible absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface opacity-0 shadow-popover transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <div className="border-b border-border px-4 py-3">
                    <p className="truncate text-sm font-semibold text-text-strong">
                      {user?.firstName || ''} {user?.lastName || ''}
                    </p>
                    <p className="truncate text-xs text-text-muted">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link to={dashboardPath} className="flex items-center gap-2 px-4 py-2 text-sm text-text-base hover:bg-muted">
                      <LayoutDashboard className="h-4 w-4 text-text-muted" aria-hidden="true" />
                      Bảng điều khiển
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-text-base hover:bg-muted">
                      <User className="h-4 w-4 text-text-muted" aria-hidden="true" />
                      Hồ sơ của tôi
                    </Link>
                    <Link to="/booking/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-text-base hover:bg-muted">
                      <BookOpenCheck className="h-4 w-4 text-text-muted" aria-hidden="true" />
                      Đơn đặt xe
                    </Link>
                    <Link to="/favorites" className="flex items-center gap-2 px-4 py-2 text-sm text-text-base hover:bg-muted">
                      <Heart className="h-4 w-4 text-text-muted" aria-hidden="true" />
                      Xe yêu thích
                    </Link>
                  </div>
                  <div className="border-t border-border py-2">
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-danger hover:bg-muted"
                      type="button"
                      onClick={() => void logout()}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-border py-3 md:hidden">
            <nav className="space-y-1" aria-label="Điều hướng di động">
              {navItems.map((item) => renderNavLink(item, true))}
            </nav>
            <div className="mt-3 border-t border-border pt-3">
              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface text-sm font-semibold text-text-strong">
                    <LogIn className="h-4 w-4" aria-hidden="true" />
                    Đăng nhập
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white">
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    Đăng ký
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-text-base hover:bg-muted">
                    <BatteryCharging className="h-4 w-4 text-primary" aria-hidden="true" />
                    Bảng điều khiển
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-danger hover:bg-muted"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};
