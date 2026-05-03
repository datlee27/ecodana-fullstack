import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({ open, title, description, size = 'md', children, footer, onClose }: ModalProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={cn('max-h-[90vh] w-full overflow-hidden rounded-xl bg-surface shadow-popover', sizeClasses[size])}>
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-text-strong">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-text-muted">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex justify-end gap-3 border-t border-border bg-muted px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
};
