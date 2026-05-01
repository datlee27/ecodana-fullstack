import { Bell, HelpCircle, Search } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { OwnerSidebar } from '../components/layout/OwnerSidebar';

/**
 * OwnerLayout — shell for vehicle owners.
 *
 * Structure mirrors AdminLayout for role-surface consistency (design.md §10).
 */
const OwnerLayout = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      {/* Topbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <div className="hidden lg:block lg:w-8" aria-hidden="true" />

        <div className="relative w-full max-w-sm mx-auto">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            aria-label="Tìm kiếm"
            className="
              h-9 w-full rounded-lg border border-border bg-canvas
              pl-9 pr-4 text-sm text-text-base placeholder:text-text-muted
              outline-none transition
              focus:border-primary focus:ring-2 focus:ring-primary/20
            "
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Thông báo"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-muted hover:text-text-strong"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Trợ giúp"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-muted hover:text-text-strong"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Tài khoản"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white transition hover:opacity-90"
          >
            O
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-60 shrink-0 lg:flex lg:flex-col">
          <OwnerSidebar />
        </div>
        <main className="flex-1 overflow-y-auto" id="main-content" role="main">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
