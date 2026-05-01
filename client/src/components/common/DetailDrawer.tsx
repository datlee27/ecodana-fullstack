/**
 * DetailDrawer — slide-in panel from the right for "View Detail" actions.
 * Shared across Vehicles, Bookings, Contracts, Payments, Refunds.
 *
 * Usage:
 *   <DetailDrawer title="Chi tiết hợp đồng" open={!!selected} onClose={() => setSelected(null)}>
 *     <DetailRow label="Mã hợp đồng" value={contract.contractCode} />
 *     <DetailSection title="Thông tin khách hàng">...</DetailSection>
 *   </DetailDrawer>
 */
import { useEffect } from 'react';

interface DetailDrawerProps {
  title: string;
  subtitle?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const WIDTH = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function DetailDrawer({ title, subtitle, open, onClose, children, width = 'md' }: DetailDrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full ${WIDTH[width]} bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border-color shrink-0">
          <div className="min-w-0 pr-4">
            <h2 className="text-base font-semibold text-text-strong truncate">{title}</h2>
            {subtitle && <p className="text-xs text-text-muted mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted-surface flex items-center justify-center text-text-muted shrink-0 transition-colors"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-elegant">
          {children}
        </div>
      </div>
    </>
  );
}

/** A labelled row in the detail drawer */
export function DetailRow({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-muted font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-text-strong ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}

/** A titled group of detail rows */
export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest pt-1">{title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-canvas rounded-xl p-4 border border-border-color">
        {children}
      </div>
    </div>
  );
}

/** A status badge for inside the drawer */
export function DetailBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}
