/**
 * Shared inline action menu component for all Admin tables.
 * Closes on outside click. Forwards ref to the trigger button for positioning.
 */
import { useEffect, useRef, useState } from 'react';

export interface MenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

const VARIANT_CLS: Record<NonNullable<MenuItem['variant']>, string> = {
  default: 'text-text-base hover:bg-muted-surface',
  danger:  'text-red-600 hover:bg-red-50',
  success: 'text-eco-green hover:bg-eco-green-soft',
  warning: 'text-orange-600 hover:bg-orange-50',
};

export function ActionMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 160);
    }
    setOpen((o) => !o);
  };

  const dropCls = openUp
    ? 'absolute right-0 z-50 bottom-full mb-1 w-48 rounded-xl border border-border-color bg-surface shadow-xl py-1 text-sm'
    : 'absolute right-0 z-50 mt-1 w-48 rounded-xl border border-border-color bg-surface shadow-xl py-1 text-sm';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="w-8 h-8 rounded text-text-muted hover:bg-muted-surface inline-flex items-center justify-center transition-colors"
        aria-label="Thao tác"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className={dropCls}>
          {items.map((item, idx) =>
            item.label === '---' ? (
              <div key={idx} className="my-1 border-t border-border-color" />
            ) : (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={() => { item.onClick(); setOpen(false); }}
                className={`w-full text-left px-4 py-2 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_CLS[item.variant ?? 'default']}`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/** Simple confirm dialog — reusable across all admin pages */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Xác nhận',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'success' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const btnCls = {
    danger:  'bg-red-600 hover:bg-red-700',
    success: 'bg-eco-green hover:bg-eco-green-hover',
    warning: 'bg-orange-500 hover:bg-orange-600',
  }[confirmVariant];

  const iconMap = { danger: 'warning', success: 'check_circle', warning: 'info' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${confirmVariant === 'danger' ? 'bg-red-100' : confirmVariant === 'success' ? 'bg-eco-green-soft' : 'bg-orange-100'}`}>
          <span className={`material-symbols-outlined text-[24px] ${confirmVariant === 'danger' ? 'text-red-600' : confirmVariant === 'success' ? 'text-eco-green' : 'text-orange-600'}`}>
            {iconMap[confirmVariant]}
          </span>
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-text-strong">{title}</p>
          <p className="text-sm text-text-muted">{message}</p>
        </div>
        <div className="flex gap-3 justify-center pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 h-9 rounded-lg border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 h-9 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2 ${btnCls}`}
          >
            {busy && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Notes input dialog — used for refund approve/reject */
export function NotesDialog({
  title,
  placeholder,
  confirmLabel,
  confirmVariant = 'success',
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  placeholder?: string;
  confirmLabel: string;
  confirmVariant?: 'success' | 'danger';
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [notes, setNotes] = useState('');
  const btnCls = confirmVariant === 'success' ? 'bg-eco-green hover:bg-eco-green-hover' : 'bg-red-600 hover:bg-red-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-semibold text-text-strong">{title}</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={placeholder ?? 'Nhập ghi chú...'}
          rows={4}
          className="w-full px-3 py-2 border border-border-color rounded-lg text-sm text-text-strong bg-surface resize-none focus:outline-none focus:ring-1 focus:ring-eco-green"
        />
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="px-4 h-9 rounded-lg border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors">
            Huỷ
          </button>
          <button
            type="button"
            onClick={() => onConfirm(notes.trim())}
            disabled={busy}
            className={`px-4 h-9 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center gap-2 ${btnCls}`}
          >
            {busy && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
