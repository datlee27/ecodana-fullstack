import { Button, EmptyState, Skeleton, VehicleCard, cn } from '../../design-system';
import type { Vehicle } from '../../types/vehicle';

type VehicleGridColumns = 3 | 4;

interface VehicleGridProps {
  vehicles: Vehicle[];
  loading?: boolean;
  error?: string | null;
  favoriteIds?: string[];
  showFavorite?: boolean;
  onToggleFavorite?: (vehicleId: string) => void;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  columns?: VehicleGridColumns;
  className?: string;
}

const gridClasses: Record<VehicleGridColumns, string> = {
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const spanClasses: Record<VehicleGridColumns, string> = {
  3: 'sm:col-span-2 lg:col-span-3',
  4: 'md:col-span-2 lg:col-span-4',
};

const skeletonCounts: Record<VehicleGridColumns, number> = {
  3: 6,
  4: 8,
};

const VehicleCardSkeleton = () => {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="relative aspect-[16/10] bg-muted">
        <Skeleton className="absolute right-3 top-3 h-6 w-20 rounded-full" />
        <Skeleton className="absolute left-3 top-3 h-10 w-10 rounded-full bg-surface" />
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-4/5" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </article>
  );
};

export const VehicleGrid = ({
  vehicles,
  loading = false,
  error = null,
  favoriteIds = [],
  showFavorite = false,
  onToggleFavorite,
  onRetry,
  emptyTitle = 'Không tìm thấy xe phù hợp',
  emptyDescription = 'Vui lòng điều chỉnh bộ lọc và thử lại.',
  columns = 3,
  className,
}: VehicleGridProps) => {
  const gridClassName = cn('grid gap-8', gridClasses[columns], className);
  const fullSpanClassName = cn('col-span-1', spanClasses[columns]);

  if (loading) {
    return (
      <div className={gridClassName} aria-busy="true">
        {Array.from({ length: skeletonCounts[columns] }).map((_, index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={gridClassName}>
        <EmptyState
          tone="danger"
          title="Không thể tải danh sách xe"
          description={error}
          className={fullSpanClassName}
          action={
            onRetry ? (
              <Button type="button" variant="danger" onClick={onRetry}>
                Tải lại
              </Button>
            ) : null
          }
        />
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className={gridClassName}>
        <EmptyState title={emptyTitle} description={emptyDescription} className={fullSpanClassName} />
      </div>
    );
  }

  return (
    <div className={gridClassName}>
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.vehicleId}
          vehicle={vehicle}
          favorited={favoriteIds.includes(vehicle.vehicleId)}
          showFavorite={showFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};
