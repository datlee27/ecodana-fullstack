import axios from 'axios';
import { CalendarDays, Car, CheckCircle2, FileText, MapPin, Tag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createBooking, getAvailableDiscounts, previewCheckout } from '../../../api/bookingApi';
import { getVehicleDetail } from '../../../api/vehicleApi';
import { Button, EmptyState, Input, PageContainer, Select, Skeleton } from '../../../design-system';
import {
  BookingInfoCard,
  BookingStepIndicator,
  BookingSummaryPanel,
  formatCurrency,
  formatDateTime,
  formatDateTimeFromInputs,
  type BookingSummaryRow,
} from '../../../features/booking';
import { useNotification } from '../../../hooks/useNotification';
import type { ApiErrorResponse } from '../../../types/api';
import type { CheckoutPreviewData, DiscountOption } from '../../../types/booking';
import type { Vehicle } from '../../../types/vehicle';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const apiError = error.response?.data?.data as { error?: string } | undefined;
  return apiError?.error ?? error.response?.data?.message ?? fallback;
};

const CheckoutLoadingState = () => {
  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="space-y-8 py-10">
        <div className="flex justify-center">
          <Skeleton className="h-10 w-full max-w-2xl" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
          <Skeleton className="h-[28rem] w-full rounded-xl" />
        </div>
      </PageContainer>
    </section>
  );
};

const BookingCheckoutPage = () => {
  const navigate = useNavigate();
  const { warning, error: notifyError, success } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  const vehicleId = searchParams.get('vehicleId') ?? '';
  const [pickupDate, setPickupDate] = useState(searchParams.get('pickupDate') ?? '');
  const [pickupTime, setPickupTime] = useState(searchParams.get('pickupTime') ?? '09:00');
  const [returnDate, setReturnDate] = useState(searchParams.get('returnDate') ?? '');
  const [returnTime, setReturnTime] = useState(searchParams.get('returnTime') ?? '11:00');
  const [pickupLocation] = useState(searchParams.get('pickupLocation') ?? '');
  const [discountCode, setDiscountCode] = useState(searchParams.get('discountCode') ?? '');

  const [editMode, setEditMode] = useState(false);
  const [editPickupDate, setEditPickupDate] = useState(pickupDate);
  const [editPickupTime, setEditPickupTime] = useState(pickupTime);
  const [editReturnDate, setEditReturnDate] = useState(returnDate);
  const [editReturnTime, setEditReturnTime] = useState(returnTime);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [discounts, setDiscounts] = useState<DiscountOption[]>([]);
  const [preview, setPreview] = useState<CheckoutPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const syncSearchParams = (nextValues: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(nextValues).forEach(([key, value]) => {
      if (value && value.trim().length > 0) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const hasRequiredParams = Boolean(vehicleId) && Boolean(pickupLocation);

    if (!hasRequiredParams) {
      setLoading(false);
      setError('Thiếu thông tin đặt xe. Vui lòng quay lại trang chi tiết xe và chọn thuê lại.');
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [vehicleData, discountData] = await Promise.all([
          getVehicleDetail(vehicleId),
          getAvailableDiscounts().catch(() => []),
        ]);
        setVehicle(vehicleData);
        setDiscounts(discountData);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, 'Không thể tải trang checkout.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [pickupLocation, vehicleId]);

  useEffect(() => {
    const hasRequiredParams =
      Boolean(vehicleId) &&
      Boolean(pickupDate) &&
      Boolean(pickupTime) &&
      Boolean(returnDate) &&
      Boolean(returnTime);

    if (!hasRequiredParams || !vehicle) {
      setPreview(null);
      return;
    }

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const response = await previewCheckout({
          vehicleId,
          pickupDate,
          pickupTime,
          returnDate,
          returnTime,
          discountCode: discountCode || undefined,
        });
        setPreview(response);
      } catch (apiError) {
        setPreview(null);
        setPreviewError(getApiErrorMessage(apiError, 'Không thể tính toán chi phí đặt xe.'));
      } finally {
        setPreviewLoading(false);
      }
    };

    void loadPreview();
  }, [discountCode, pickupDate, pickupTime, returnDate, returnTime, vehicle, vehicleId]);

  const durationText = useMemo(() => {
    if (!preview) return '--';
    const remainingHours = Number(preview.remainingHours ?? 0);
    if (remainingHours <= 0) {
      return `${preview.fullDays} ngày`;
    }
    return `${preview.fullDays} ngày ${remainingHours.toFixed(2)} giờ`;
  }, [preview]);

  const summaryRows = useMemo<BookingSummaryRow[]>(() => {
    if (!preview) return [];
    return [
      {
        label: 'Đơn giá thuê',
        value: formatCurrency(preview.vehicleRentalFee),
        helper:
          preview.remainingHours > 0
            ? `${preview.fullDays} ngày x ${formatCurrency(preview.dailyPrice)} + ${preview.remainingHours.toFixed(2)} giờ x ${formatCurrency(preview.hourlyPrice)}`
            : undefined,
      },
      ...(preview.discountAmount > 0
        ? [
            {
              label: `Giảm giá${preview.discountCode ? ` (${preview.discountCode})` : ''}`,
              value: `-${formatCurrency(preview.discountAmount)}`,
              tone: 'success' as const,
            },
          ]
        : []),
    ];
  }, [preview]);

  const handleStartEditTime = () => {
    setEditPickupDate(pickupDate);
    setEditPickupTime(pickupTime);
    setEditReturnDate(returnDate);
    setEditReturnTime(returnTime);
    setEditMode(true);
  };

  const handleCancelEditTime = () => {
    setEditMode(false);
    setEditPickupDate(pickupDate);
    setEditPickupTime(pickupTime);
    setEditReturnDate(returnDate);
    setEditReturnTime(returnTime);
  };

  const handleSaveEditTime = () => {
    if (!editPickupDate || !editPickupTime || !editReturnDate || !editReturnTime) {
      warning('Vui lòng điền đầy đủ ngày giờ nhận/trả xe.');
      return;
    }

    const start = new Date(`${editPickupDate}T${editPickupTime}:00`);
    const end = new Date(`${editReturnDate}T${editReturnTime}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      warning('Ngày trả xe phải sau ngày nhận xe.');
      return;
    }

    setPickupDate(editPickupDate);
    setPickupTime(editPickupTime);
    setReturnDate(editReturnDate);
    setReturnTime(editReturnTime);
    syncSearchParams({
      pickupDate: editPickupDate,
      pickupTime: editPickupTime,
      returnDate: editReturnDate,
      returnTime: editReturnTime,
    });
    setEditMode(false);
    success('Đã cập nhật thời gian thuê xe.');
  };

  const handleApplyDiscount = (nextCode: string) => {
    setDiscountCode(nextCode);
    syncSearchParams({ discountCode: nextCode || null });
  };

  const handleConfirmBooking = async () => {
    if (!agreeTerms) {
      warning('Vui lòng đồng ý điều khoản và điều kiện trước khi xác nhận đặt xe.');
      return;
    }

    if (!vehicle || !preview) {
      warning('Thông tin checkout chưa sẵn sàng. Vui lòng thử lại.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createBooking({
        vehicleId: vehicle.vehicleId,
        pickupDate,
        pickupTime,
        returnDate,
        returnTime,
        pickupLocation,
        discountCode: discountCode || undefined,
        paymentMethod: 'DEPOSIT',
      });
      navigate(`/booking/payment/${created.bookingId}`);
    } catch (apiError) {
      const message = getApiErrorMessage(apiError, 'Không thể tạo đơn đặt xe.');
      setError(message);
      notifyError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <CheckoutLoadingState />;
  }

  if (error || !vehicle) {
    return (
      <section className="bg-canvas pb-16">
        <PageContainer className="py-10">
          <EmptyState
            tone={error ? 'danger' : 'neutral'}
            title={error ? 'Không thể tải trang checkout' : 'Không tìm thấy xe'}
            description={error ?? 'Vui lòng quay lại danh sách xe và thử lại.'}
            action={
              <Link
                to={vehicleId ? `/vehicles/${vehicleId}` : '/vehicles'}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted"
              >
                Quay lại
              </Link>
            }
          />
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="space-y-8 py-10">
        <BookingStepIndicator currentStep={2} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <BookingInfoCard title="Thông tin xe" icon={<Car className="h-5 w-5 text-primary" aria-hidden="true" />}>
              <div className="flex flex-col gap-4 sm:flex-row">
                {vehicle.mainImageUrl ? (
                  <img src={vehicle.mainImageUrl} alt={vehicle.vehicleModel} className="h-36 w-full rounded-lg object-cover sm:w-40" />
                ) : (
                  <Skeleton className="h-36 w-full shrink-0 rounded-lg sm:w-40" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-text-strong">{vehicle.vehicleModel}</h2>
                  <div className="mt-4 grid gap-3 text-sm text-text-base sm:grid-cols-2">
                    <p>Biển số: <span className="font-semibold">{vehicle.licensePlate || 'Theo dữ liệu xe'}</span></p>
                    <p>Số chỗ: <span className="font-semibold">{vehicle.seats} chỗ</span></p>
                    <p>Truyền động: <span className="font-semibold">{vehicle.transmissionTypeName || 'Tự động'}</span></p>
                    <p>Nhiên liệu: <span className="font-semibold">Điện</span></p>
                  </div>
                </div>
              </div>
            </BookingInfoCard>

            <BookingInfoCard
              title="Thời gian thuê"
              icon={<CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />}
              action={
                <Button type="button" variant="ghost" onClick={() => (editMode ? handleCancelEditTime() : handleStartEditTime())}>
                  {editMode ? 'Hủy' : 'Chỉnh sửa'}
                </Button>
              }
            >
              {!editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-text-muted">Nhận xe</p>
                      <p className="mt-1 font-semibold text-text-strong">
                        {preview ? formatDateTime(preview.pickupDateTime) : formatDateTimeFromInputs(pickupDate, pickupTime)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-text-muted">Trả xe</p>
                      <p className="mt-1 font-semibold text-text-strong">
                        {preview ? formatDateTime(preview.returnDateTime) : formatDateTimeFromInputs(returnDate, returnTime)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-info/20 bg-secondary-soft p-4 text-sm text-text-base">
                    Thời gian thuê: <span className="font-semibold text-info">{durationText}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Ngày nhận" type="date" value={editPickupDate} onChange={(event) => setEditPickupDate(event.target.value)} />
                    <Input label="Giờ nhận" type="time" value={editPickupTime} onChange={(event) => setEditPickupTime(event.target.value)} />
                    <Input label="Ngày trả" type="date" value={editReturnDate} onChange={(event) => setEditReturnDate(event.target.value)} />
                    <Input label="Giờ trả" type="time" value={editReturnTime} onChange={(event) => setEditReturnTime(event.target.value)} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={handleSaveEditTime}>Lưu thay đổi</Button>
                    <Button type="button" variant="outline" onClick={handleCancelEditTime}>Hủy</Button>
                  </div>
                </div>
              )}
            </BookingInfoCard>

            <BookingInfoCard title="Địa điểm giao xe" icon={<MapPin className="h-5 w-5 text-info" aria-hidden="true" />}>
              <p className="text-text-base">{pickupLocation}</p>
            </BookingInfoCard>

            <BookingInfoCard title="Mã giảm giá" icon={<Tag className="h-5 w-5 text-primary" aria-hidden="true" />}>
              <Select value={discountCode} onChange={(event) => handleApplyDiscount(event.target.value)}>
                <option value="">Không dùng mã giảm giá</option>
                {discounts.map((discount) => (
                  <option key={discount.discountId} value={discount.voucherCode}>
                    {discount.discountName} ({discount.discountType === 'Percentage' ? `${discount.discountValue}%` : formatCurrency(discount.discountValue)})
                  </option>
                ))}
              </Select>
            </BookingInfoCard>

            <BookingInfoCard title="Điều khoản và điều kiện" icon={<FileText className="h-5 w-5 text-primary" aria-hidden="true" />}>
              <div className="space-y-3 text-sm text-text-base">
                {[
                  'Sử dụng xe đúng mục đích và tuân thủ quy định pháp luật.',
                  'Không sử dụng xe để cầm cố, thế chấp hoặc chuyển nhượng trái phép.',
                  'Giữ gìn xe sạch sẽ và trả xe đúng thời gian đã thỏa thuận.',
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    {item}
                  </p>
                ))}
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-warning/20 bg-muted p-4">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-base">
                  Tôi đã đọc và đồng ý với Điều khoản sử dụng và Chính sách bảo mật của EcoDana.
                </span>
              </label>
            </BookingInfoCard>
          </div>

          <BookingSummaryPanel
            rows={summaryRows}
            totalLabel="Tổng cộng"
            totalValue={preview ? formatCurrency(preview.totalAmount) : '--'}
            loading={previewLoading}
            error={previewError}
            actions={
              <>
                <Button
                  type="button"
                  onClick={() => void handleConfirmBooking()}
                  disabled={submitting || previewLoading || !preview}
                  fullWidth
                  size="lg"
                  loading={submitting}
                >
                  {submitting ? 'Đang tạo đơn...' : 'Xác nhận đặt xe'}
                </Button>
                <Button type="button" variant="outline" fullWidth size="lg" onClick={() => navigate(`/vehicles/${vehicle.vehicleId}`)}>
                  Quay lại chi tiết xe
                </Button>
              </>
            }
            footer="Thanh toán được xử lý qua cổng PayOS ở bước tiếp theo."
          />
        </div>
      </PageContainer>
    </section>
  );
};

export default BookingCheckoutPage;
