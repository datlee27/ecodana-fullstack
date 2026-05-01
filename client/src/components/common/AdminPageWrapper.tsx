// ─── AdminPageWrapper — reusable 3-zone flex layout for admin pages ───────────
//
//   ┌──────────────────────────────────────────────┐
//   │  flex-none   │  title + description          │
//   │              │  topControls (KPIs / filters)  │
//   ├──────────────┼──────────────────────────────┤
//   │  flex-1      │  children (scrollable table)  │
//   │  min-h-0     │  ← overflow-y-auto here       │
//   ├──────────────┼──────────────────────────────┤
//   │  flex-none   │  bottomControls (pagination)  │
//   └──────────────┴──────────────────────────────┘
//
import type { ReactNode } from 'react';

interface AdminPageWrapperProps {
  /** Page title rendered as h2 */
  title: string;
  /** Optional subtitle below the title */
  description?: string;
  /** Fixed top zone: stat cards, search bars, filters */
  topControls?: ReactNode;
  /** Fixed bottom zone: pagination */
  bottomControls?: ReactNode;
  /** Main scrollable content — typically a table card */
  children: ReactNode;
  /** Optional extra className on the root container */
  className?: string;
}

const AdminPageWrapper = ({
  title,
  description,
  topControls,
  bottomControls,
  children,
  className = '',
}: AdminPageWrapperProps) => {
  return (
    <div className={`flex h-full min-h-0 flex-col ${className}`}>
      {/* ── Zone 1: Fixed top (title + controls) ── */}
      <div className="flex-none">
        <div className="mb-6" data-shell-zone="page-heading">
          <h2 className="text-2xl font-bold text-text-strong">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-text-muted">{description}</p>
          )}
        </div>
        {topControls}
      </div>

      {/* ── Zone 2: Scrollable content area ── */}
      <div className="relative flex-1 min-h-0">
        <div className="h-full overflow-y-auto overflow-x-auto scrollbar-elegant">
          {children}
        </div>
      </div>

      {/* ── Zone 3: Fixed bottom (pagination) ── */}
      {bottomControls && (
        <div className="flex-none">{bottomControls}</div>
      )}
    </div>
  );
};

export default AdminPageWrapper;
