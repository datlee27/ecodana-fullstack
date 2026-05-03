import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton, cn } from '../../design-system';

export interface BookingSummaryRow {
  label: string;
  value: ReactNode;
  tone?: 'default' | 'success' | 'danger' | 'info';
  helper?: ReactNode;
}

interface BookingSummaryPanelProps {
  title?: string;
  rows: BookingSummaryRow[];
  totalLabel: string;
  totalValue: ReactNode;
  loading?: boolean;
  error?: string | null;
  actions?: ReactNode;
  footer?: ReactNode;
}

const toneClasses: Record<NonNullable<BookingSummaryRow['tone']>, string> = {
  default: 'text-text-strong',
  success: 'text-success',
  danger: 'text-danger',
  info: 'text-info',
};

export const BookingSummaryPanel = ({
  title = 'Tóm tắt chi phí',
  rows,
  totalLabel,
  totalValue,
  loading = false,
  error = null,
  actions,
  footer,
}: BookingSummaryPanelProps) => {
  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="space-y-3" aria-busy="true">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : null}

        {error ? (
          <div className="flex gap-2 rounded-lg border border-danger/20 bg-muted p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {!loading ? (
          <div className="space-y-3 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-text-muted">{row.label}</span>
                  <span className={cn('text-right font-semibold', toneClasses[row.tone ?? 'default'])}>{row.value}</span>
                </div>
                {row.helper ? <div className="text-xs leading-5 text-text-muted">{row.helper}</div> : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-base font-semibold text-text-strong">{totalLabel}</span>
            <span className="text-2xl font-bold text-primary">{totalValue}</span>
          </div>
        </div>

        {actions ? <div className="space-y-3">{actions}</div> : null}
        {footer ? <div className="border-t border-border pt-4 text-sm text-text-muted">{footer}</div> : null}
      </CardContent>
    </Card>
  );
};
