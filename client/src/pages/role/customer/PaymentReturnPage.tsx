import axios from 'axios';
import { AlertTriangle, CheckCircle2, Clock, CreditCard, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmBookingPaymentReturn } from '../../../api/bookingApi';
import { Badge, Button, Card, CardContent, EmptyState, PageContainer, Skeleton } from '../../../design-system';
import { BookingStepIndicator, formatCurrency } from '../../../features/booking';
import type { ApiErrorResponse } from '../../../types/api';
import type { PaymentReturnData } from '../../../types/booking';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const apiError = error.response?.data?.data as { error?: string } | undefined;
  return apiError?.error ?? error.response?.data?.message ?? fallback;
};

const PaymentReturnPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentReturnData | null>(null);

  const bookingId = searchParams.get('bookingId') ?? undefined;
  const orderCode = searchParams.get('orderCode') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const code = searchParams.get('code') ?? undefined;
  const cancel = searchParams.get('cancel') ?? undefined;

  useEffect(() => {
    const load = async () => {
      if (!bookingId && !orderCode) {
        setLoading(false);
        setError('Không có thông tin giao dịch để xác nhận thanh toán.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await confirmBookingPaymentReturn({
          code,
          status,
          cancel,
          orderCode,
          bookingId,
        });
        setResult(response);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, 'Không thể xác nhận kết quả thanh toán.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [bookingId, cancel, code, orderCode, status]);

  const viewType = useMemo(() => {
    if (!result) return 'error';
    if (result.warning) return 'warning';
    if (result.success) return 'success';
    return 'error';
  }, [result]);

  useEffect(() => {
    if (viewType !== 'success' || !result?.bookingId) return;
    const timeoutId = window.setTimeout(() => {
      navigate(`/booking/confirmation/${result.bookingId}`);
    }, 10000);
    return () => window.clearTimeout(timeoutId);
  }, [navigate, result?.bookingId, viewType]);

  const displayBookingId = result?.bookingId ?? bookingId;
  const displayOrderCode = orderCode;

  const stateConfig = {
    success: {
      title: 'Thanh toán thành công',
      icon: CheckCircle2,
      tone: 'success' as const,
      iconClass: 'bg-primary-soft text-success',
    },
    warning: {
      title: 'Đã hủy thanh toán',
      icon: AlertTriangle,
      tone: 'warning' as const,
      iconClass: 'bg-muted text-warning',
    },
    error: {
      title: 'Thanh toán thất bại',
      icon: XCircle,
      tone: 'danger' as const,
      iconClass: 'bg-muted text-danger',
    },
  }[viewType];

  const StateIcon = stateConfig.icon;

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="max-w-3xl space-y-8 py-10">
        <BookingStepIndicator currentStep={3} />

        {loading ? (
          <Card>
            <CardContent className="space-y-5 py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Clock className="h-8 w-8 animate-pulse text-text-muted" aria-hidden="true" />
              </div>
              <Skeleton className="mx-auto h-6 w-64" />
              <Skeleton className="mx-auto h-4 w-80 max-w-full" />
            </CardContent>
          </Card>
        ) : null}

        {!loading && error ? (
          <EmptyState
            tone="danger"
            title="Không thể xác nhận thanh toán"
            description={error}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                {displayBookingId ? (
                  <Link
                    to={`/booking/payment/${displayBookingId}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-danger px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Thử lại
                  </Link>
                ) : null}
                <Link
                  to="/booking/my-bookings"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted"
                >
                  Quay lại danh sách
                </Link>
              </div>
            }
          />
        ) : null}

        {!loading && !error && result ? (
          <Card>
            <CardContent className="space-y-6 py-8 text-center">
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${stateConfig.iconClass}`}>
                <StateIcon className="h-10 w-10" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <Badge tone={stateConfig.tone} size="md">{stateConfig.title}</Badge>
                <h1 className="text-3xl font-bold text-text-strong">{stateConfig.title}</h1>
                <p className="mx-auto max-w-xl text-text-muted">{result.message}</p>
              </div>

              {viewType === 'success' && (result.paidAmount ?? 0) > 0 ? (
                <div className="rounded-xl border border-primary/20 bg-primary-soft p-5">
                  <p className="text-sm font-medium text-text-muted">Số tiền đã thanh toán</p>
                  <p className="mt-1 text-3xl font-bold text-primary">{formatCurrency(result.paidAmount ?? 0)}</p>
                </div>
              ) : null}

              <div className="rounded-xl border border-border bg-muted p-5 text-left">
                <div className="divide-y divide-border text-sm">
                  <div className="flex justify-between gap-4 py-2">
                    <span className="text-text-muted">Mã đơn hàng</span>
                    <span className="text-right font-semibold text-text-strong">{result.bookingCode}</span>
                  </div>
                  {displayOrderCode ? (
                    <div className="flex justify-between gap-4 py-2">
                      <span className="text-text-muted">Mã giao dịch</span>
                      <span className="text-right font-semibold text-text-strong">{displayOrderCode}</span>
                    </div>
                  ) : null}
                  {viewType === 'success' && (result.totalAmount ?? 0) > 0 ? (
                    <div className="flex justify-between gap-4 py-2">
                      <span className="text-text-muted">Tổng tiền đơn</span>
                      <span className="text-right font-semibold text-text-strong">{formatCurrency(result.totalAmount ?? 0)}</span>
                    </div>
                  ) : null}
                  {viewType === 'success' && (result.remainingAmount ?? 0) >= 0 ? (
                    <div className="flex justify-between gap-4 py-2">
                      <span className="text-text-muted">Còn lại</span>
                      <span className="text-right font-semibold text-text-strong">{formatCurrency(result.remainingAmount ?? 0)}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {viewType === 'success' && displayBookingId ? (
                  <Link
                    to={`/booking/confirmation/${displayBookingId}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                  >
                    <CreditCard className="h-4 w-4" aria-hidden="true" />
                    Xem chi tiết đơn hàng
                  </Link>
                ) : null}

                {(viewType === 'error' || viewType === 'warning') && displayBookingId ? (
                  <Link
                    to={`/booking/payment/${displayBookingId}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-warning px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Thanh toán lại
                  </Link>
                ) : null}

                <Button type="button" variant="outline" onClick={() => navigate('/booking/my-bookings')}>
                  Xem tất cả đơn hàng
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </PageContainer>
    </section>
  );
};

export default PaymentReturnPage;
