import { BatteryCharging, Heart, IdCard, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from './Badge';
import { Button } from './Button';
import type { Vehicle } from '../../types/vehicle';
import { cn } from '../utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  favorited?: boolean;
  showFavorite?: boolean;
  to?: string;
  className?: string;
  onToggleFavorite?: (vehicleId: string) => void;
}

const statusTone = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  const normalized = status.toUpperCase();
  if (normalized === 'AVAILABLE') return 'success';
  if (normalized === 'RENTED' || normalized === 'PENDINGAPPROVAL') return 'warning';
  if (normalized === 'MAINTENANCE' || normalized === 'UNAVAILABLE') return 'danger';
  return 'neutral';
};

const statusLabel = (status: string) => {
  const normalized = status.toUpperCase();
  if (normalized === 'AVAILABLE') return 'Sẵn sàng';
  if (normalized === 'RENTED') return 'Đã thuê';
  if (normalized === 'MAINTENANCE') return 'Bảo trì';
  if (normalized === 'PENDINGAPPROVAL') return 'Chờ duyệt';
  return status;
};

export const VehicleCard = ({ vehicle, favorited = false, showFavorite = false, to, className, onToggleFavorite }: VehicleCardProps) => {
  const detailPath = to ?? `/vehicles/${vehicle.vehicleId}`;
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(vehicle.dailyPrice);

  return (
    <article className={cn('overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-card', className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Link to={detailPath} className="block h-full">
          {vehicle.mainImageUrl ? (
            <img
              src={vehicle.mainImageUrl}
              alt={vehicle.vehicleModel}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium text-text-muted">
              Chưa có ảnh xe
            </div>
          )}
        </Link>
        <Badge tone={statusTone(vehicle.status)} className="absolute right-3 top-3">
          {statusLabel(vehicle.status)}
        </Badge>
        {showFavorite ? (
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-3 top-3 bg-white/90 text-slate-600 hover:bg-white"
            onClick={() => onToggleFavorite?.(vehicle.vehicleId)}
            aria-label={favorited ? 'Bỏ khỏi danh sách yêu thích' : 'Thêm vào danh sách yêu thích'}
          >
            <Heart className={cn('h-5 w-5', favorited && 'fill-red-500 text-red-500')} aria-hidden="true" />
          </Button>
        ) : null}
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Badge tone="info">{vehicle.vehicleType === 'ElectricCar' ? 'Ô tô điện' : 'Xe máy điện'}</Badge>
          <h2 className="truncate text-lg font-semibold text-text-strong">{vehicle.vehicleModel}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              {vehicle.seats} chỗ
            </span>
            <span className="inline-flex items-center gap-1">
              <IdCard className="h-4 w-4 text-primary" aria-hidden="true" />
              {vehicle.requiresLicense ? 'Cần bằng lái' : 'Không cần bằng lái'}
            </span>
            <span className="inline-flex items-center gap-1">
              <BatteryCharging className="h-4 w-4 text-primary" aria-hidden="true" />
              Điện
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-text-muted">Giá từ</p>
            <p className="text-xl font-bold text-primary">{formattedPrice} đ</p>
          </div>
          <Link to={detailPath} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
};
