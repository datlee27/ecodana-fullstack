import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '../../design-system';

export interface KpiCardDef {
  title: string;
  icon: LucideIcon;
  iconTone?: 'green' | 'blue' | 'amber' | 'red';
}

const iconBg: Record<NonNullable<KpiCardDef['iconTone']>, string> = {
  green: 'bg-primary-soft text-primary',
  blue:  'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  red:   'bg-red-50 text-red-600',
};

interface KpiStripProps {
  cards: KpiCardDef[];
}

/**
 * KpiStrip — a row of skeleton-valued stat cards.
 * Values are shown as skeletons (API-bound) per design.md §12.
 */
export const KpiStrip = ({ cards }: KpiStripProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const bg = iconBg[card.iconTone ?? 'green'];
        return (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-muted">{card.title}</p>
              <Skeleton className="mt-1.5 h-6 w-16" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
