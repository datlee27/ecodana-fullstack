import axios from 'axios';
import { CreditCard, Info, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createBookingPaymentLink, getBookingPaymentSummary } from '../../../api/bookingApi';
import { Badge, Button, EmptyState, PageContainer, Skeleton } from '../../../design-system';
import { BookingInfoCard, BookingStepIndicator, BookingSummaryPanel, formatCurrency, formatDateTime, type BookingSummaryRow } from '../../../features/booking';
import type { ApiErrorResponse } from '../../../types/api';
import type { PaymentSummaryData } from '../../../types/booking';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const apiError = error.response?.data?.data as { error?: string } | undefined;
  return apiError?.error ?? error.response?.data?.message ?? fallback;
};

const PaymentLoadingState = () => {
  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="max-w-5xl space-y-6 py-10">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </PageContainer>
    </section>
  );
};

const BookingPaymentPage = () => {
  const { bookingId } = useParams();
  const [summary, setSummary] = useState<PaymentSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingType, setProcessingType] = useState<'deposit' | 'full' | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) {
        setLoading(false);
        setError('Không tìm thấy đơn đặt xe để thanh toán.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getBookingPaymentSummary(bookingId);
        setSummary(data);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, 'Không thể tải thông tin thanh toán.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [bookingId]);

  const depositNeedToPay = useMemo(() => {
    if (!summary) return 0;
    return Math.max(0, summary.depositAmount - summary.paidAmount);
  }, [summary]);

  const summaryRows = useMemo<BookingSummaryRow[]>(() => {
    if (!summary) return [];
    return [
      { label: 'Tổng tiền thuê', value: formatCurrency(summary.totalAmount) },
      { label: 'Đã thanh toán', value: formatCurrency(summary.paidAmount), tone: summary.paidAmount > 0 ? 'success' : 'default' },
      { label: 'Còn lại', value: formatCurrency(summary.remainingAmount), tone: summary.remainingAmount > 0 ? 'info' : 'success' },
    ];
  }, [summary]);

  const handlePay = async (paymentType: 'deposit' | 'full') => {
    if (!bookingId) return;
    setError(null);
    setProcessingType(paymentType);
    try {
      const data = await createBookingPaymentLink(bookingId, paymentType);
      if (!data.checkoutUrl) {
        throw new Error('Không nhận được link thanh toán PayOS.');
      }
      window.location.assign(data.checkoutUrl);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Không thể tạo link thanh toán.'));
      setProcessingType(null);
    }
  };

  if (loading) {
    return <PaymentLoadingState />;
  }

  if (error || !summary) {
    return (
      <section className="bg-canvas pb-16">
        <PageContainer className="max-w-4xl py-10">
          <EmptyState
            tone="danger"
            title="Không thể tải trang thanh toán"
            description={error ?? 'Không tìm thấy thông tin thanh toán.'}
            action={
              <Link
                to="/booking/my-bookings"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted"
              >
                Quay lại lịch sử đặt xe
              </Link>
            }
          />
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="max-w-5xl space-y-8 py-10">
        <BookingStepIndicator currentStep={2} />

        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-strong">Thanh toán đặt xe</h1>
              <p className="mt-1 text-sm text-text-muted">Mã đặt xe: <span className="font-semibold text-primary">{summary.bookingCode}</span></p>
            </div>
            <Badge tone={summary.remainingAmount <= 0 ? 'success' : 'info'} size="md">
              {summary.remainingAmount <= 0 ? 'Đã thanh toán đủ' : 'Chờ thanh toán'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BookingInfoCard title="Thông tin đặt xe" icon={<Info className="h-5 w-5 text-primary" aria-hidden="true" />}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <h2 className="font-semibold text-text-strong">Thông tin xe</h2>
                  <p className="flex justify-between gap-4"><span className="text-text-muted">Xe</span><span className="text-right font-semibold">{summary.vehicleModel}</span></p>
                  <p className="flex justify-between gap-4"><span className="text-text-muted">Biển số</span><span className="text-right font-semibold">{summary.licensePlate || 'Theo dữ liệu xe'}</span></p>
                </div>
                <div className="space-y-2 text-sm">
                  <h2 className="font-semibold text-text-strong">Thời gian thuê</h2>
                  <p className="flex justify-between gap-4"><span className="text-text-muted">Nhận xe</span><span className="text-right font-semibold">{formatDateTime(summary.pickupDateTime)}</span></p>
                  <p className="flex justify-between gap-4"><span className="text-text-muted">Trả xe</span><span className="text-right font-semibold">{formatDateTime(summary.returnDateTime)}</span></p>
                </div>
              </div>
            </BookingInfoCard>

            {summary.remainingAmount <= 0 ? (
              <BookingInfoCard title="Trạng thái thanh toán" icon={<ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />}>
                <p className="text-text-base">Đơn đặt xe này đã được thanh toán đầy đủ.</p>
                <div className="mt-4">
                  <Link
                    to={`/booking/confirmation/${summary.bookingId}`}
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    Xem chi tiết đơn hàng
                  </Link>
                </div>
              </BookingInfoCard>
            ) : (
              <BookingInfoCard title="Chọn phương thức thanh toán" icon={<CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />}>
                <div className="grid gap-4">
                  <div className="rounded-xl border-2 border-primary bg-primary-soft p-5">
                    <h3 className="text-lg font-bold text-text-strong">Thanh toán cọc</h3>
                    <p className="mt-1 text-sm text-text-muted">Đặt cọc trước, thanh toán phần còn lại khi nhận xe.</p>
                    <div className="mt-4 grid gap-2 rounded-lg border border-primary/20 bg-surface p-3 text-sm">
                      <p className="flex justify-between gap-4"><span>Thanh toán ngay</span><span className="font-bold text-primary">{formatCurrency(depositNeedToPay)}</span></p>
                      <p className="flex justify-between gap-4"><span>Khi nhận xe</span><span className="font-semibold">{formatCurrency(summary.remainingAmount - depositNeedToPay)}</span></p>
                    </div>
                    <Button
                      type="button"
                      className="mt-4"
                      fullWidth
                      size="lg"
                      disabled={processingType !== null || depositNeedToPay <= 0}
                      loading={processingType === 'deposit'}
                      leftIcon={<LockKeyhole className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => void handlePay('deposit')}
                    >
                      {processingType === 'deposit' ? 'Đang tạo link...' : 'Thanh toán cọc qua PayOS'}
                    </Button>
                  </div>

                  <div className="rounded-xl border-2 border-info bg-secondary-soft p-5">
                    <h3 className="text-lg font-bold text-text-strong">Thanh toán toàn bộ</h3>
                    <p className="mt-1 text-sm text-text-muted">Thanh toán một lần và không cần trả thêm khi nhận xe.</p>
                    <div className="mt-4 rounded-lg border border-info/20 bg-surface p-3 text-sm">
                      <p className="flex justify-between gap-4"><span>Thanh toán ngay</span><span className="font-bold text-info">{formatCurrency(summary.remainingAmount)}</span></p>
                    </div>
                    <Button
                      type="button"
                      className="mt-4"
                      variant="secondary"
                      fullWidth
                      size="lg"
                      disabled={processingType !== null}
                      loading={processingType === 'full'}
                      leftIcon={<LockKeyhole className="h-4 w-4" aria-hidden="true" />}
                      onClick={() => void handlePay('full')}
                    >
                      {processingType === 'full' ? 'Đang tạo link...' : 'Thanh toán toàn bộ qua PayOS'}
                    </Button>
                  </div>
                </div>
              </BookingInfoCard>
            )}
          </div>

          <BookingSummaryPanel
            rows={summaryRows}
            totalLabel="Cần thanh toán"
            totalValue={formatCurrency(summary.remainingAmount)}
            error={error}
            footer="Giao dịch được xử lý qua PayOS. Sau khi hoàn tất, bạn sẽ được chuyển về EcoDana."
          />
        </div>
      </PageContainer>
    </section>
  );
};

export default BookingPaymentPage;
