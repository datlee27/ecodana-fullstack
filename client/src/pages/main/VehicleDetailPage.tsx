import {
  BatteryCharging,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  IdCard,
  ImageIcon,
  Info,
  MapPin,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvailableDiscounts } from '../../api/bookingApi';
import { getFavoriteIds, toggleFavorite } from '../../api/favoriteApi';
import { getVehicleDetail, getVehicles } from '../../api/vehicleApi';
import { Badge, Button, Card, CardContent, EmptyState, Input, Modal, PageContainer, Select, Skeleton, cn } from '../../design-system';
import { formatCurrency } from '../../features/booking';
import { VehicleGrid } from '../../features/vehicle/VehicleGrid';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import type { DiscountOption } from '../../types/booking';
import type { Vehicle } from '../../types/vehicle';

type TabKey = 'features' | 'documents' | 'location' | 'owner' | 'reviews';
type DeliveryOption = 'custom' | 'airport' | 'free';

const DEFAULT_LOCATION_TEXT = 'Chọn địa điểm giao xe';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'features', label: 'Đặc điểm' },
  { key: 'documents', label: 'Giấy tờ' },
  { key: 'location', label: 'Vị trí xe' },
  { key: 'owner', label: 'Chủ xe' },
  { key: 'reviews', label: 'Đánh giá' },
];

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

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { warning, error: notifyError, success, info } = useNotification();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [relatedVehicles, setRelatedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('features');

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('custom');
  const [customAddress, setCustomAddress] = useState('');
  const [airportLocation, setAirportLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState(DEFAULT_LOCATION_TEXT);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('11:00');

  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountLabel, setDiscountLabel] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [availableDiscounts, setAvailableDiscounts] = useState<DiscountOption[]>([]);
  const [feesExpanded, setFeesExpanded] = useState(false);

  useEffect(() => {
    const loadVehicle = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const detail = await getVehicleDetail(id);
        setVehicle(detail);

        const vehicles = await getVehicles({ category: detail.categoryName || undefined });
        setRelatedVehicles(vehicles.filter((item) => item.vehicleId !== detail.vehicleId).slice(0, 3));

        if (isAuthenticated) {
          const [ids, discounts] = await Promise.all([
            getFavoriteIds(),
            getAvailableDiscounts().catch(() => []),
          ]);
          setIsFavorite(ids.includes(detail.vehicleId));
          setAvailableDiscounts(discounts);
        } else {
          setIsFavorite(false);
          setAvailableDiscounts([]);
        }
      } catch {
        setError('Không thể tải chi tiết xe.');
      } finally {
        setLoading(false);
      }
    };

    void loadVehicle();
  }, [id, isAuthenticated]);

  const allImages = useMemo(() => {
    if (!vehicle) return [];
    const images = [vehicle.mainImageUrl, ...(vehicle.imageUrls ?? [])].filter(Boolean);
    return Array.from(new Set(images));
  }, [vehicle]);

  const currentImage = allImages[selectedImageIndex] ?? '';

  useEffect(() => {
    if (selectedImageIndex >= allImages.length) {
      setSelectedImageIndex(0);
    }
  }, [allImages.length, selectedImageIndex]);

  const rentalComputation = useMemo(() => {
    if (!pickupDate || !returnDate || !vehicle) {
      return { valid: false, rentalPrice: 0, durationText: '0 ngày', dayCount: 0 };
    }

    const start = new Date(`${pickupDate}T${pickupTime}:00`);
    const end = new Date(`${returnDate}T${returnTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return { valid: false, rentalPrice: 0, durationText: '0 ngày', dayCount: 0 };
    }

    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const fullDays = Math.floor(diffHours / 24);
    const remainingHours = Math.max(0, diffHours - fullDays * 24);
    const rentalPrice = vehicle.dailyPrice * fullDays + vehicle.hourlyPrice * remainingHours;
    const displayHours = Math.ceil(diffHours - fullDays * 24);

    return {
      valid: true,
      rentalPrice,
      durationText: `${fullDays} ngày${displayHours > 0 ? ` ${displayHours} giờ` : ''}`,
      dayCount: Math.max(1, Math.ceil(diffHours / 24)),
    };
  }, [pickupDate, pickupTime, returnDate, returnTime, vehicle]);

  useEffect(() => {
    if (!discountCode) {
      setDiscountAmount(0);
      setDiscountLabel('');
      setDiscountMessage('');
      return;
    }

    const selected = availableDiscounts.find((option) => option.voucherCode === discountCode);
    if (!selected) {
      setDiscountAmount(0);
      setDiscountLabel('');
      setDiscountMessage('');
      return;
    }

    if (!rentalComputation.valid) {
      setDiscountAmount(0);
      setDiscountLabel('');
      setDiscountMessage('Vui lòng chọn ngày nhận/trả xe để áp dụng mã.');
      return;
    }

    if (rentalComputation.rentalPrice < selected.minOrderAmount) {
      setDiscountAmount(0);
      setDiscountLabel('');
      setDiscountMessage(`Đơn hàng chưa đủ ${formatCurrency(selected.minOrderAmount)} để áp dụng mã này.`);
      return;
    }

    const computed =
      selected.discountType === 'Percentage'
        ? (rentalComputation.rentalPrice * selected.discountValue) / 100
        : selected.discountValue;

    const finalAmount = Math.min(computed, rentalComputation.rentalPrice);
    setDiscountAmount(finalAmount);
    setDiscountLabel(selected.discountName);
    setDiscountMessage(`Đã áp dụng ${selected.discountName}.`);
  }, [availableDiscounts, discountCode, rentalComputation]);

  const totalAmount = Math.max(0, rentalComputation.rentalPrice - discountAmount + deliveryFee);

  const handleToggleFavorite = async () => {
    if (!vehicle) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${vehicle.vehicleId}` } });
      return;
    }

    try {
      const result = await toggleFavorite(vehicle.vehicleId);
      setIsFavorite(result.favorited);
      if (result.favorited) {
        success('Xe đã được thêm vào danh sách yêu thích.');
      } else {
        info('Xe đã được xóa khỏi danh sách yêu thích.');
      }
    } catch {
      notifyError('Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại.');
    }
  };

  const handleOpenLocationModal = () => {
    if (pickupLocation === 'Nhận xe tại vị trí của xe') {
      setDeliveryOption('free');
      setAirportLocation('');
      setCustomAddress('');
    } else if (pickupLocation === 'Điểm giao nhận ưu tiên 1' || pickupLocation === 'Điểm giao nhận ưu tiên 2') {
      setDeliveryOption('airport');
      setAirportLocation(pickupLocation);
      setCustomAddress('');
    } else if (pickupLocation !== DEFAULT_LOCATION_TEXT) {
      setDeliveryOption('custom');
      setCustomAddress(pickupLocation);
      setAirportLocation('');
    } else {
      setDeliveryOption('custom');
      setAirportLocation('');
    }

    setLocationModalOpen(true);
  };

  const handleUpdateLocation = () => {
    if (deliveryOption === 'custom') {
      if (!customAddress.trim()) {
        warning('Vui lòng nhập địa chỉ giao xe.');
        return;
      }
      setPickupLocation(customAddress.trim());
      setDeliveryFee(0);
      setLocationModalOpen(false);
      success('Đã cập nhật địa điểm giao xe.');
      return;
    }

    if (deliveryOption === 'airport') {
      if (!airportLocation) {
        warning('Vui lòng chọn điểm giao nhận.');
        return;
      }
      setPickupLocation(airportLocation);
      setDeliveryFee(0);
      setLocationModalOpen(false);
      success('Đã cập nhật địa điểm giao xe.');
      return;
    }

    setPickupLocation('Nhận xe tại vị trí của xe');
    setDeliveryFee(0);
    setLocationModalOpen(false);
    success('Đã cập nhật địa điểm giao xe.');
  };

  const handleSubmitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicle) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${vehicle.vehicleId}` } });
      return;
    }

    if (vehicle.status?.toUpperCase() !== 'AVAILABLE') {
      warning('Xe hiện không khả dụng để đặt thuê.');
      return;
    }

    if (pickupLocation === DEFAULT_LOCATION_TEXT) {
      warning('Vui lòng chọn địa điểm giao xe.');
      return;
    }

    if (!rentalComputation.valid) {
      warning('Vui lòng chọn ngày và giờ thuê hợp lệ.');
      return;
    }

    const query = new URLSearchParams({
      vehicleId: vehicle.vehicleId,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      pickupLocation,
    });

    if (discountCode) {
      query.set('discountCode', discountCode);
    }

    navigate(`/booking/checkout?${query.toString()}`);
  };

  if (loading) {
    return (
      <section className="bg-canvas pb-16">
        <PageContainer className="space-y-8 py-10">
          <div className="space-y-3">
            <Skeleton className="h-9 w-2/3 max-w-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <Skeleton className="h-[34rem] w-full rounded-xl" />
          </div>
        </PageContainer>
      </section>
    );
  }

  if (error || !vehicle) {
    return (
      <section className="bg-canvas pb-16">
        <PageContainer className="py-10">
          <EmptyState
            tone={error ? 'danger' : 'neutral'}
            title={error ? 'Không thể tải chi tiết xe' : 'Không tìm thấy xe'}
            description={error ?? 'Xe này không tồn tại hoặc đã ngừng hiển thị.'}
          />
        </PageContainer>
      </section>
    );
  }

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="space-y-8 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone(vehicle.status)} size="md">{statusLabel(vehicle.status)}</Badge>
              <Badge tone="info" size="md">{vehicle.vehicleType === 'ElectricCar' ? 'Ô tô điện' : 'Xe máy điện'}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-text-strong sm:text-4xl">{vehicle.vehicleModel}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                {vehicle.seats} chỗ
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IdCard className="h-4 w-4 text-primary" aria-hidden="true" />
                {vehicle.requiresLicense ? 'Cần bằng lái' : 'Không cần bằng lái'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BatteryCharging className="h-4 w-4 text-primary" aria-hidden="true" />
                Xe điện
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant={isFavorite ? 'danger' : 'outline'}
            leftIcon={<Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} aria-hidden="true" />}
            onClick={() => void handleToggleFavorite()}
          >
            {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden">
              <button
                type="button"
                className="relative block aspect-[16/10] w-full bg-muted text-left"
                disabled={!currentImage}
                onClick={() => currentImage && setGalleryOpen(true)}
              >
                {currentImage ? (
                  <img src={currentImage} alt={vehicle.vehicleModel} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-text-muted">
                    Chưa có ảnh xe
                  </div>
                )}
                {currentImage ? (
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-slate-950/70 px-3 py-2 text-sm font-semibold text-white">
                    <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    Xem ảnh
                  </span>
                ) : null}
              </button>
              {allImages.length > 1 ? (
                <div className="grid grid-cols-4 gap-2 p-3">
                  {allImages.slice(0, 4).map((imageUrl, index) => (
                    <button
                      key={imageUrl}
                      type="button"
                      className={cn(
                        'aspect-[16/10] overflow-hidden rounded-lg border-2 bg-muted',
                        index === selectedImageIndex ? 'border-primary' : 'border-transparent hover:border-primary/60',
                      )}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={imageUrl} alt={`${vehicle.vehicleModel} ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </Card>

            <Card>
              <div className="overflow-x-auto border-b border-border">
                <div className="flex min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={cn(
                        'border-b-2 px-5 py-3 text-sm font-semibold transition-colors',
                        activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-primary',
                      )}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <CardContent className="space-y-6">
                {activeTab === 'features' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[
                        { label: 'Truyền động', value: vehicle.transmissionTypeName || 'Tự động', icon: Car },
                        { label: 'Số ghế', value: `${vehicle.seats} chỗ`, icon: Users },
                        { label: 'Nhiên liệu', value: 'Điện', icon: Zap },
                        { label: 'Pin', value: vehicle.batteryCapacity ? `${vehicle.batteryCapacity} kWh` : 'Theo xe', icon: BatteryCharging },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg bg-muted p-4">
                          <item.icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
                          <p className="text-xs font-medium text-text-muted">{item.label}</p>
                          <p className="mt-1 font-semibold text-text-strong">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text-strong">Mô tả</h2>
                      <p className="mt-3 leading-7 text-text-base">
                        {vehicle.description || 'Thông tin mô tả xe sẽ được hiển thị khi chủ xe cập nhật dữ liệu.'}
                      </p>
                    </div>
                    {vehicle.features && vehicle.features.length > 0 ? (
                      <div>
                        <h3 className="font-semibold text-text-strong">Tiện ích</h3>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {vehicle.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-base">
                              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}

                {activeTab === 'documents' ? (
                  <div className="space-y-3 text-sm leading-6 text-text-base">
                    <p className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 text-success" aria-hidden="true" />
                      Người thuê cần cung cấp giấy tờ hợp lệ theo chính sách xác minh của EcoDana.
                    </p>
                    <p className="flex items-start gap-2">
                      <IdCard className="mt-0.5 h-4 w-4 text-info" aria-hidden="true" />
                      Yêu cầu bằng lái: {vehicle.requiresLicense ? 'Có yêu cầu bằng lái phù hợp.' : 'Không yêu cầu bằng lái.'}
                    </p>
                  </div>
                ) : null}

                {activeTab === 'location' ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted p-6 text-sm text-text-muted">
                    <MapPin className="mb-3 h-6 w-6 text-info" aria-hidden="true" />
                    Vị trí xe sẽ được hiển thị theo thông tin chủ xe cấu hình và trạng thái đặt xe.
                  </div>
                ) : null}

                {activeTab === 'owner' ? (
                  <div className="space-y-3 text-sm leading-6 text-text-base">
                    <p>Thông tin chủ xe được quản lý trong hệ thống EcoDana và sẽ hiển thị theo dữ liệu tài khoản thực tế.</p>
                    <p className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 text-info" aria-hidden="true" />
                      Mọi trao đổi và xác nhận sau đặt xe được theo dõi trong lịch sử đặt xe.
                    </p>
                  </div>
                ) : null}

                {activeTab === 'reviews' ? (
                  <EmptyState
                    title="Chưa có đánh giá"
                    description="Đánh giá từ khách thuê sẽ hiển thị tại đây khi có dữ liệu."
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="space-y-5">
                <div>
                  <p className="text-sm text-text-muted">Giá thuê theo ngày</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(vehicle.dailyPrice)}</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmitBooking}>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-strong">Địa điểm giao xe</label>
                    <button
                      type="button"
                      onClick={handleOpenLocationModal}
                      className="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 text-left text-sm text-text-strong shadow-sm transition-colors hover:bg-muted"
                    >
                      <span className="truncate">{pickupLocation}</span>
                      <MapPin className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Ngày nhận" type="date" required value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
                    <Input label="Giờ nhận" type="time" required value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} />
                    <Input label="Ngày trả" type="date" required value={returnDate} onChange={(event) => setReturnDate(event.target.value)} />
                    <Input label="Giờ trả" type="time" required value={returnTime} onChange={(event) => setReturnTime(event.target.value)} />
                  </div>

                  {rentalComputation.valid ? (
                    <div className="rounded-lg border border-info/20 bg-secondary-soft p-3 text-sm text-text-base">
                      Thời gian thuê: <span className="font-semibold text-info">{rentalComputation.durationText}</span>
                    </div>
                  ) : null}

                  <Select label="Mã giảm giá" value={discountCode} onChange={(event) => setDiscountCode(event.target.value)}>
                    <option value="">Không dùng mã</option>
                    {availableDiscounts.map((discount) => (
                      <option key={discount.discountId} value={discount.voucherCode}>
                        {discount.discountName}
                      </option>
                    ))}
                  </Select>
                  {discountMessage ? (
                    <p className={cn('text-sm', discountAmount > 0 ? 'text-success' : 'text-danger')}>{discountMessage}</p>
                  ) : null}

                  <div className="space-y-2 border-t border-border pt-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-text-muted">Tiền thuê</span>
                      <span className="font-semibold text-text-strong">{formatCurrency(rentalComputation.rentalPrice)}</span>
                    </div>
                    {discountAmount > 0 ? (
                      <div className="flex justify-between gap-3 text-success">
                        <span>Giảm giá {discountLabel ? `(${discountLabel})` : ''}</span>
                        <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-3">
                      <span className="text-text-muted">Phí giao xe</span>
                      <span className="font-semibold text-text-strong">{formatCurrency(deliveryFee)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-text-strong">Tổng cộng</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    disabled={vehicle.status?.toUpperCase() !== 'AVAILABLE'}
                  >
                    {vehicle.status?.toUpperCase() === 'AVAILABLE' ? 'Chọn thuê' : 'Xe không khả dụng'}
                  </Button>
                </form>

                <div className="border-t border-border pt-4">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between text-left text-sm font-medium text-text-base hover:text-primary"
                    onClick={() => setFeesExpanded((prev) => !prev)}
                  >
                    Phí phụ có thể phát sinh
                    <ChevronRight className={cn('h-4 w-4 transition-transform', feesExpanded && 'rotate-90')} aria-hidden="true" />
                  </button>
                  {feesExpanded ? (
                    <div className="mt-3 space-y-2 text-xs leading-5 text-text-muted">
                      <p>Phí vượt giờ, phí quá km và phí vệ sinh được áp dụng theo chính sách hệ thống nếu phát sinh.</p>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {relatedVehicles.length > 0 ? (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-text-strong">Xe tương tự</h2>
            <VehicleGrid vehicles={relatedVehicles} columns={3} />
          </section>
        ) : null}
      </PageContainer>

      <Modal
        open={locationModalOpen}
        title="Địa điểm giao nhận xe"
        description="Chọn cách nhận xe phù hợp trước khi chuyển sang checkout."
        onClose={() => setLocationModalOpen(false)}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setLocationModalOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleUpdateLocation}>
              Cập nhật
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block rounded-lg border border-border p-4">
            <span className="flex items-center gap-2 font-semibold text-text-strong">
              <input type="radio" checked={deliveryOption === 'custom'} onChange={() => setDeliveryOption('custom')} />
              Địa chỉ tùy chỉnh
            </span>
            {deliveryOption === 'custom' ? (
              <div className="mt-3 space-y-3 pl-6">
                <Input value={customAddress} onChange={(event) => setCustomAddress(event.target.value)} placeholder="Nhập địa chỉ giao xe" />
                <p className="text-xs text-text-muted">Phí giao xe tùy chỉnh hiện được tính theo chính sách hệ thống.</p>
              </div>
            ) : null}
          </label>

          <label className="block rounded-lg border border-border p-4">
            <span className="flex items-center gap-2 font-semibold text-text-strong">
              <input type="radio" checked={deliveryOption === 'airport'} onChange={() => setDeliveryOption('airport')} />
              Điểm giao nhận ưu tiên
            </span>
            {deliveryOption === 'airport' ? (
              <div className="mt-3 grid gap-2 pl-6">
                {['Điểm giao nhận ưu tiên 1', 'Điểm giao nhận ưu tiên 2'].map((item) => (
                  <label key={item} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <input type="radio" name="airport-location" checked={airportLocation === item} onChange={() => setAirportLocation(item)} />
                      {item}
                    </span>
                    <span className="font-semibold text-primary">Theo chính sách</span>
                  </label>
                ))}
              </div>
            ) : null}
          </label>

          <label className="block rounded-lg border border-border p-4">
            <span className="flex items-center gap-2 font-semibold text-text-strong">
              <input type="radio" checked={deliveryOption === 'free'} onChange={() => setDeliveryOption('free')} />
              Nhận xe tại vị trí của xe
            </span>
            {deliveryOption === 'free' ? (
              <p className="mt-2 pl-6 text-sm text-text-muted">Địa chỉ cụ thể được xác nhận sau khi đơn đặt xe được tạo.</p>
            ) : null}
          </label>
        </div>
      </Modal>

      <Modal
        open={galleryOpen}
        title="Thư viện ảnh xe"
        size="xl"
        onClose={() => setGalleryOpen(false)}
      >
        {allImages.length > 0 ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl bg-muted">
              <img src={allImages[selectedImageIndex]} alt={vehicle.vehicleModel} className="max-h-[65vh] w-full object-contain" />
              {allImages.length > 1 ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-surface/90"
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Ảnh trước</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface/90"
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allImages.length)}
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Ảnh sau</span>
                  </Button>
                </>
              ) : null}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2', index === selectedImageIndex ? 'border-primary' : 'border-transparent')}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={image} alt={`${vehicle.vehicleModel} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
};

export default VehicleDetailPage;
