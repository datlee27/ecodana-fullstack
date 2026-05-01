import { CalendarCheck, CalendarX, Eye, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Card } from '../../design-system';
import type { BookingSummary } from '../../types/booking';
import { bookingStatusText, formatCurrency, formatDateTime, getBookingStatusTone } from './bookingFormat';

interface CustomerBookingCardProps {
  booking: BookingSummary;
}

export const CustomerBookingCard = ({ booking }: CustomerBookingCardProps) => {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-card">
      <div className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-text-strong">{booking.bookingCode}</h3>
              <Badge tone={getBookingStatusTone(booking.status)}>{bookingStatusText[booking.status] || booking.status}</Badge>
            </div>
            <p className="text-base font-semibold text-text-strong">{booking.vehicleModel}</p>
            <p className="flex items-start gap-2 text-sm text-text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
              <span>{booking.pickupLocation || 'Theo thông tin đặt xe'}</span>
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-text-muted">Tổng tiền</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(booking.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 rounded-lg bg-muted p-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-text-muted">Nhận xe</p>
            <p className="flex items-center gap-2 text-sm font-semibold text-text-strong">
              <CalendarCheck className="h-4 w-4 text-success" aria-hidden="true" />
              {formatDateTime(booking.pickupDateTime)}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-text-muted">Trả xe</p>
            <p className="flex items-center gap-2 text-sm font-semibold text-text-strong">
              <CalendarX className="h-4 w-4 text-danger" aria-hidden="true" />
              {formatDateTime(booking.returnDateTime)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to={`/booking/confirmation/${booking.bookingId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Xem chi tiết
          </Link>
        </div>
      </div>
    </Card>
  );
};
