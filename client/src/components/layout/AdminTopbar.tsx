interface AdminTopbarProps {
  scope?: 'admin' | 'staff';
}

export const AdminTopbar = ({ scope = 'admin' }: AdminTopbarProps) => {
  const searchPlaceholder =
    scope === 'staff' ? 'Tìm kiếm nghiệp vụ...' : 'Tìm kiếm hệ thống...';

  return (
    <header
      className="fixed left-64 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border-color bg-white px-8"
      data-shell-zone="topbar"
    >
      {/* Search */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-lg border-transparent bg-muted-surface py-2 pl-10 pr-4 text-sm text-text-strong transition-shadow placeholder:text-text-muted focus:border-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green"
          />
        </div>
      </div>

      {/* Right cluster */}
      <div
        className="flex shrink-0 items-center gap-3"
        data-shell-zone="topbar-actions"
      >
        <button
          type="button"
          aria-label="Thông báo"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-muted-surface"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            notifications
          </span>
        </button>

        <button
          type="button"
          aria-label="Trợ giúp"
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-muted-surface"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            help
          </span>
        </button>

        {/* Avatar */}
        <button
          type="button"
          aria-label="Tài khoản"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eco-green text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          A
        </button>
      </div>
    </header>
  );
};
