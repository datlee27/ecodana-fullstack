import type { ReactNode } from 'react';
import { cn } from '../utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'neutral' | 'danger';
  className?: string;
}

export const EmptyState = ({ title, description, action, tone = 'neutral', className }: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed bg-surface px-6 py-10 text-center shadow-sm',
        tone === 'danger' ? 'border-danger text-danger' : 'border-border text-text-base',
        className,
      )}
    >
      <div className="mx-auto max-w-md space-y-3">
        <h3 className={cn('text-lg font-semibold', tone === 'danger' ? 'text-danger' : 'text-text-strong')}>{title}</h3>
        {description ? <p className="text-sm leading-6 text-text-muted">{description}</p> : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </div>
  );
};
