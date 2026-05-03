import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminTopbar } from '../components/layout/AdminTopbar';

type AdminLayoutScope = 'admin' | 'staff';

interface AdminLayoutProps {
  scope: AdminLayoutScope;
}

/**
 * AdminLayout — height-constrained shell (no outer page scroll)
 *
 *   ┌───────────────────────────────────────────────────────┐
 *   │ Sidebar (fixed, w-64)  │  Topbar (fixed h-16)        │
 *   │                        ├─────────────────────────────┤
 *   │                        │  flex-none: heading / KPIs  │
 *   │                        │  flex-1:   table (scroll-y) │
 *   │                        │  flex-none: pagination      │
 *   └────────────────────────┴─────────────────────────────┘
 */
const AdminLayout = ({ scope }: AdminLayoutProps) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas text-text-base antialiased">
      {/* Fixed sidebar */}
      <AdminSidebar scope={scope} />

      {/* Main wrapper — offset by sidebar width */}
      <div className="ml-64 flex h-screen flex-1 flex-col">
        {/* Fixed topbar */}
        <AdminTopbar scope={scope} />

        {/* Page content — fills exactly viewport minus topbar, no outer scroll */}
        <main
          className="mt-16 flex h-[calc(100vh-4rem)] flex-col overflow-hidden px-8 pt-6 pb-4"
          id="main-content"
          role="main"
          data-shell-zone="main"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
