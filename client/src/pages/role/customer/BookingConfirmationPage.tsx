import { CalendarCheck, Car, CreditCard, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBookingDetail, getBookingPaymentSummary } from '../../../api/bookingApi';
import { Badge, Button, EmptyState, PageContainer, Skeleton } from '../../../design-system';
import { BookingInfoCard, BookingStepIndicator, bookingStatusText, formatCurrency, formatDateTime, getBookingStatusTone } from '../../../features/booking';
import type { BookingSummary } from '../../../types/booking';

const ConfirmationLoadingState = () => {
  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="max-w-4xl space-y-6 py-10">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </PageContainer>
    </section>
  );
};

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [paidAmount, setPaidAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        setLoading(false);
        setError('Không tìm thấy đơn đặt xe.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [bookingData, paymentSummary] = await Promise.all([
          getBookingDetail(bookingId),
          getBookingPaymentSummary(bookingId),
        ]);
        setBooking(bookingData);
        setPaidAmount(paymentSummary.paidAmount);
        setRemainingAmount(paymentSummary.remainingAmount);
      } catch {
        setError('Không thể tải chi tiết đặt xe.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [bookingId]);

  if (loading) {
    return <ConfirmationLoadingState />;
  }

  if (error || !booking) {
    return (
      <section className="bg-canvas pb-16">
        <PageContainer className="max-w-4xl py-10">
          <EmptyState
            tone="danger"
            title="Không thể tải chi tiết đặt xe"
            description={error ?? 'Không tìm thấy đơn đặt xe.'}
            action={
              <Link
                to="/booking/my-bookings"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted"
              >
                Về danh sách đặt xe
              </Link>
            }
          />
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="max-w-4xl space-y-8 py-10">
        <BookingStepIndicator currentStep={3} />

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-strong">Chi tiết đặt xe</h1>
              <p className="mt-1 text-sm text-text-muted">Mã đơn: <span className="font-semibold text-primary">{booking.bookingCode}</span></p>
            </div>
            <Badge tone={getBookingStatusTone(booking.status)} size="md">
              {bookingStatusText[booking.status] || booking.status}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6">
          <BookingInfoCard title="Thông tin xe" icon={<Car className="h-5 w-5 text-primary" aria-hidden="true" />}>
            <p className="text-lg font-semibold text-text-strong">{booking.vehicleModel}</p>
          </BookingInfoCard>

          <BookingInfoCard title="Thời gian và địa điểm" icon={<CalendarCheck className="h-5 w-5 text-primary" aria-hidden="true" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-text-muted">Nhận xe</p>
                <p className="mt-1 font-semibold text-text-strong">{formatDateTime(booking.pickupDateTime)}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-text-muted">Trả xe</p>
                <p className="mt-1 font-semibold text-text-strong">{formatDateTime(booking.returnDateTime)}</p>
              </div>
            </div>
            <p className="mt-4 flex items-start gap-2 text-sm text-text-base">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
              {booking.pickupLocation || 'Theo thông tin đặt xe'}
            </p>
          </BookingInfoCard>

          <BookingInfoCard title="Thanh toán" icon={<CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />}>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between gap-4"><span className="text-text-muted">Tổng tiền</span><span className="font-semibold text-text-strong">{formatCurrency(booking.totalAmount)}</span></p>
              <p className="flex justify-between gap-4"><span className="text-text-muted">Đã thanh toán</span><span className="font-semibold text-success">{formatCurrency(paidAmount)}</span></p>
              <p className="flex justify-between gap-4"><span className="text-text-muted">Còn lại</span><span className="font-semibold text-primary">{formatCurrency(remainingAmount)}</span></p>
            </div>
          </BookingInfoCard>
        </div>

        <div className="flex flex-wrap gap-3">
          {remainingAmount > 0 ? (
            <Button type="button" variant="secondary" onClick={() => window.location.assign(`/booking/payment/${booking.bookingId}`)}>
              Thanh toán ngay
            </Button>
          ) : null}
          <Link to="/booking/my-bookings" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
            Về danh sách đặt xe
          </Link>
          <Link to="/vehicles" className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted">
            Khám phá thêm xe
          </Link>
        </div>
      </PageContainer>
    </section>
  );
};

export default BookingConfirmationPage;
