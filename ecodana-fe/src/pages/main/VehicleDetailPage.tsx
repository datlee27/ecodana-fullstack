import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAvailableDiscounts } from '../../api/bookingApi';
import { getFavoriteIds, toggleFavorite } from '../../api/favoriteApi';
import { getVehicleDetail, getVehicles } from '../../api/vehicleApi';
import { useAuth } from '../../hooks/useAuth';
import type { DiscountOption } from '../../types/booking';
import type { Vehicle } from '../../types/vehicle';

type TabKey = 'features' | 'documents' | 'location' | 'owner' | 'reviews';
type DeliveryOption = 'custom' | 'airport' | 'free';

const DEFAULT_LOCATION_TEXT = 'Chon dia diem giao xe';

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} ₫`;

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
        const related = vehicles.filter((item) => item.vehicleId !== detail.vehicleId).slice(0, 3);
        setRelatedVehicles(related);

        if (isAuthenticated) {
          const [ids, discounts] = await Promise.all([
            getFavoriteIds(),
            getAvailableDiscounts().catch(() => []),
          ]);
          setIsFavorite(ids.includes(detail.vehicleId));
          setAvailableDiscounts(discounts);
        } else {
          setAvailableDiscounts([]);
        }
      } catch {
        setError('Khong the tai chi tiet xe.');
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

  const currentImage = allImages[selectedImageIndex] || 'https://via.placeholder.com/1000x600?text=No+Image';
  const galleryImages = allImages.length > 0 ? allImages : [currentImage];

  const rentalComputation = useMemo(() => {
    if (!pickupDate || !returnDate) {
      return { valid: false, rentalPrice: 0, durationText: '0 ngay', dayCount: 0 };
    }

    const start = new Date(`${pickupDate}T${pickupTime}:00`);
    const end = new Date(`${returnDate}T${returnTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start || !vehicle) {
      return { valid: false, rentalPrice: 0, durationText: '0 ngay', dayCount: 0 };
    }

    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const diffHours = diffMinutes / 60;

    const fullDays = Math.floor(diffHours / 24);
    const remainingHours = Math.max(0, diffHours - fullDays * 24);

    const rentalPrice = vehicle.dailyPrice * fullDays + vehicle.hourlyPrice * remainingHours;

    const displayDays = Math.floor(diffHours / 24);
    const displayHours = Math.ceil(diffHours - displayDays * 24);
    const durationText = `${displayDays} ngay${displayHours > 0 ? ` ${displayHours} gio` : ''}`;
    const dayCount = Math.max(1, Math.ceil(diffHours / 24));

    return {
      valid: true,
      rentalPrice,
      durationText,
      dayCount,
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
      setDiscountMessage('Vui long chon ngay nhan/tra xe de ap dung ma.');
      return;
    }

    if (rentalComputation.rentalPrice < selected.minOrderAmount) {
      setDiscountAmount(0);
      setDiscountLabel('');
      setDiscountMessage(`Don hang chua du ${formatCurrency(selected.minOrderAmount)} de ap dung ma nay.`);
      return;
    }

    const computed =
      selected.discountType === 'Percentage'
        ? (rentalComputation.rentalPrice * selected.discountValue) / 100
        : selected.discountValue;

    const finalAmount = Math.min(computed, rentalComputation.rentalPrice);
    setDiscountAmount(finalAmount);
    setDiscountLabel(selected.discountName);
    setDiscountMessage(`Da ap dung ${selected.discountName}.`);
  }, [availableDiscounts, discountCode, rentalComputation]);

  const totalAmount = Math.max(0, rentalComputation.rentalPrice - discountAmount + deliveryFee);
  const dailyPriceK = vehicle ? Math.round(vehicle.dailyPrice / 1000) : 0;

  const handleToggleFavorite = async () => {
    if (!vehicle) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${vehicle.vehicleId}` } });
      return;
    }

    try {
      const result = await toggleFavorite(vehicle.vehicleId);
      setIsFavorite(result.favorited);
    } catch {
      // ignore toggle error
    }
  };

  const handleOpenLocationModal = () => {
    if (pickupLocation === 'Nhan xe tai vi tri cua xe') {
      setDeliveryOption('free');
      setAirportLocation('');
      setCustomAddress('');
    } else if (pickupLocation === 'San bay Quoc te Da Nang' || pickupLocation === 'Ga Da Nang') {
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
        window.alert('Vui long nhap dia chi tuy chinh.');
        return;
      }
      setPickupLocation(customAddress.trim());
      setDeliveryFee(0);
      setLocationModalOpen(false);
      return;
    }

    if (deliveryOption === 'airport') {
      if (!airportLocation) {
        window.alert('Vui long chon dia diem san bay/ga.');
        return;
      }
      setPickupLocation(airportLocation);
      setDeliveryFee(0);
      setLocationModalOpen(false);
      return;
    }

    setPickupLocation('Nhan xe tai vi tri cua xe');
    setDeliveryFee(0);
    setLocationModalOpen(false);
  };

  const handleSubmitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!vehicle) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/vehicles/${vehicle.vehicleId}` } });
      return;
    }

    if (vehicle.status?.toUpperCase() !== 'AVAILABLE') {
      return;
    }

    if (pickupLocation === DEFAULT_LOCATION_TEXT) {
      window.alert('Vui long chon dia diem giao xe.');
      return;
    }

    if (!rentalComputation.valid) {
      window.alert('Vui long chon ngay va gio hop le.');
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
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">Dang tai...</div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-red-600">{error || 'Khong tim thay xe'}</div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{vehicle.vehicleModel}</h1>
          <button
            type="button"
            onClick={() => void handleToggleFavorite()}
            className={`flex items-center justify-center w-10 h-10 rounded-full border transition hover:bg-red-50 ${
              isFavorite ? 'bg-red-50 border-red-200' : 'border-gray-300'
            }`}
            title="Them vao yeu thich"
          >
            <i className={`fas fa-heart text-xl ${isFavorite ? 'text-red-500' : 'text-gray-400'}`} />
          </button>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
            <div className="flex items-center">
              <i className="fas fa-star text-yellow-400 mr-1" />
              <span className="font-semibold">0.0/5</span>
              <span className="mx-1">•</span>
              <span>Chua co danh gia</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-map-marker-alt text-gray-400 mr-1" />
              <span>Quan Ngu Hanh Son, TP. Da Nang</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <button
                type="button"
                className="relative group cursor-pointer w-full text-left"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setGalleryOpen(true);
                }}
              >
                <img
                  id="mainDetailImage"
                  src={currentImage}
                  alt={vehicle.vehicleModel}
                  className="w-full h-auto object-cover rounded-t-lg transition-opacity duration-300"
                  style={{ minHeight: 300, maxHeight: 500 }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center rounded-t-lg">
                  <i className="fas fa-search-plus text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>

              <div className="p-2 grid grid-cols-4 gap-2">
                {allImages.slice(0, 3).map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    type="button"
                    className={`thumbnail-item cursor-pointer rounded-lg overflow-hidden border-2 ${
                      index === selectedImageIndex ? 'border-green-500 active' : 'border-transparent hover:border-green-500'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={imageUrl} alt={`${vehicle.vehicleModel}-${index + 1}`} className="w-full h-24 object-cover" />
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  className="relative col-span-1 flex items-center justify-center bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-all h-24"
                >
                  <img
                    src={allImages[3] || currentImage}
                    alt={`${vehicle.vehicleModel}-thumb-all`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <i className="fas fa-images text-2xl mb-1" />
                      <p className="text-xs font-semibold">Xem {allImages.length} anh</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {[
                  { key: 'features', label: 'Dac diem' },
                  { key: 'documents', label: 'Giay to thue xe' },
                  { key: 'location', label: 'Vi tri xe' },
                  { key: 'owner', label: 'Chu xe' },
                  { key: 'reviews', label: 'Danh gia' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`tab-button ${activeTab === tab.key ? 'active text-primary border-b-2 border-primary' : ''}`}
                    onClick={() => setActiveTab(tab.key as TabKey)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'features' ? (
                  <div id="features" className="tab-content active block">
                    <h2 className="text-xl font-semibold mb-4">Dac diem</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-cog text-2xl text-green-500" />
                        <div>
                          <p className="text-xs text-gray-600">Truyen dong</p>
                          <p className="font-semibold">{vehicle.transmissionTypeName || 'So tu dong'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-chair text-2xl text-green-500" />
                        <div>
                          <p className="text-xs text-gray-600">So ghe</p>
                          <p className="font-semibold">{vehicle.seats} cho</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-bolt text-2xl text-green-500" />
                        <div>
                          <p className="text-xs text-gray-600">Nhien lieu</p>
                          <p className="font-semibold">Dien</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <i className="fas fa-battery-full text-2xl text-green-500" />
                        <div>
                          <p className="text-xs text-gray-600">Tieu hao</p>
                          <p className="font-semibold">
                            {vehicle.batteryCapacity ? `${vehicle.batteryCapacity} kWh/100km` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Mo ta</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {vehicle.description ||
                          'Xe dien hien dai, than thien voi moi truong, phu hop cho moi nhu cau di chuyen.'}
                      </p>
                    </div>

                    {vehicle.features && vehicle.features.length > 0 ? (
                      <div>
                        <h3 className="font-semibold mb-3">Cac tien nghi khac</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {vehicle.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                              <i className="fas fa-check-circle text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {activeTab === 'documents' ? (
                  <div id="documents" className="tab-content active block">
                    <h2 className="text-xl font-semibold mb-4">Giay to thue xe</h2>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                      <p className="text-sm text-orange-800">
                        <i className="fas fa-exclamation-circle mr-2" /> Chon 1 trong 2 hinh thuc
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-all cursor-pointer">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-id-card text-2xl text-green-500 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">GPLX (doi chieu) & Passport (giu lai)</h4>
                            <p className="text-sm text-gray-600">Doi chieu giay phep lai xe & giu lai passport.</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-all cursor-pointer">
                        <div className="flex items-start gap-3">
                          <i className="fas fa-credit-card text-2xl text-green-500 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">GPLX (doi chieu) & CCCD (doi chieu VNeID)</h4>
                            <p className="text-sm text-gray-600">Doi chieu GPLX va CCCD gan chip (VNeID).</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="font-semibold mb-4">Tai san the chap</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        15 trieu (Tien mat/Chuyen khoan) hoac xe may kem giay to goc gia tri tuong duong.
                      </p>

                      <h3 className="font-semibold mb-4">Dieu khoan</h3>
                      <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>Su dung xe dung muc dich.</li>
                        <li>Khong su dung xe vao muc dich phi phap.</li>
                        <li>Khong cam co, the chap xe thue.</li>
                        <li>Khong hut thuoc va xa rac trong xe.</li>
                        <li>Khi tra xe, vui long giu xe sach se.</li>
                      </ul>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'location' ? (
                  <div id="location" className="tab-content active block">
                    <h2 className="text-xl font-semibold mb-4">Vi tri xe</h2>
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-map-marker-alt text-green-500 text-xl mt-1" />
                        <div>
                          <p className="font-semibold">Quan Ngu Hanh Son, TP. Da Nang</p>
                          <p className="text-sm text-gray-600">
                            Day chi la khu vuc gan dung, dia chi cu the se hien thi sau khi dat coc.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <i className="fas fa-map text-4xl mb-2" />
                        <p>Dang tai ban do...</p>
                      </div>
                    </div>

                    <div className="mt-4 text-right">
                      <a href="#" className="text-green-500 hover:text-green-600 font-semibold">
                        Xem ban do <i className="fas fa-arrow-right ml-1" />
                      </a>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'owner' ? (
                  <div id="owner" className="tab-content active block">
                    <h2 className="text-xl font-semibold mb-4">Chu xe</h2>
                    <div className="text-gray-600 text-center py-8">
                      <i className="fas fa-user-slash text-4xl text-gray-400 mb-3" />
                      <p>Thong tin chu xe dang duoc dong bo API.</p>
                    </div>
                  </div>
                ) : null}

                {activeTab === 'reviews' ? (
                  <div id="reviews" className="tab-content active block">
                    <h2 className="text-xl font-semibold mb-4">Danh gia tu khach hang</h2>
                    <div className="text-gray-600">Chua co danh gia nao cho xe nay.</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-green-500">{dailyPriceK}K</span>
                  <span className="text-gray-600">/ngay</span>
                </div>
              </div>

              <form id="bookingForm" className="space-y-4" onSubmit={handleSubmitBooking}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-map-marker-alt text-green-500 mr-1" /> Dia diem giao xe
                  </label>
                  <button
                    type="button"
                    id="locationDisplay"
                    onClick={handleOpenLocationModal}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer flex justify-between items-center"
                  >
                    <span id="selectedLocationText" className="text-gray-800 truncate pr-3">
                      {pickupLocation}
                    </span>
                    <i className="fas fa-chevron-down text-gray-500 text-xs" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhan xe</label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(event) => setPickupDate(event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(event) => setPickupTime(event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm mt-7"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tra xe</label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      onChange={(event) => setReturnDate(event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      required
                      value={returnTime}
                      onChange={(event) => setReturnTime(event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm mt-7"
                    />
                  </div>
                </div>

                {rentalComputation.valid ? (
                  <div id="rentalDuration" className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="fas fa-calendar-alt text-blue-500" />
                      <span className="text-gray-700">
                        Thoi gian thue: <span className="font-semibold text-blue-600">{rentalComputation.durationText}</span>
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-tag text-green-500 mr-1" /> Cac ma giam gia hien co
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={discountCode}
                      onChange={(event) => setDiscountCode(event.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="">Ma giam gia</option>
                      {availableDiscounts.map((discount) => (
                        <option key={discount.discountId} value={discount.voucherCode}>
                          {discount.discountName} ({discount.discountType === 'Percentage' ? `${discount.discountValue}%` : formatCurrency(discount.discountValue)})
                        </option>
                      ))}
                    </select>
                  </div>
                  {discountMessage ? (
                    <div className={`mt-2 text-sm ${discountAmount > 0 ? 'text-green-600' : 'text-red-500'}`}>{discountMessage}</div>
                  ) : null}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Don gia thue ({rentalComputation.dayCount} ngay)</span>
                    <span className="font-semibold">{formatCurrency(rentalComputation.rentalPrice)}</span>
                  </div>

                  {discountAmount > 0 ? (
                    <div id="discountRow" className="flex justify-between text-green-600">
                      <span className="font-medium">
                        <i className="fas fa-tag mr-1" /> Giam gia ({discountLabel})
                      </span>
                      <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  ) : null}

                  {deliveryFee > 0 ? (
                    <div id="deliveryFeeRow" className="flex justify-between text-blue-600">
                      <span className="font-medium">
                        <i className="fas fa-shipping-fast mr-1" /> Phi giao xe
                      </span>
                      <span className="font-semibold">{formatCurrency(deliveryFee)}</span>
                    </div>
                  ) : null}
                </div>

                <div className="border-t-2 border-gray-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Tong cong</span>
                    <span className="text-2xl font-bold text-green-500">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={vehicle.status?.toUpperCase() !== 'AVAILABLE'}
                    className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-check-circle mr-2" />
                    <span>{vehicle.status?.toUpperCase() === 'AVAILABLE' ? 'CHON THUE' : 'Xe khong kha dung'}</span>
                  </button>
                </div>
              </form>

              <div className="mt-4">
                <button
                  type="button"
                  id="toggleFeesBtn"
                  onClick={() => setFeesExpanded((prev) => !prev)}
                  className="w-full text-left text-sm text-gray-600 hover:text-gray-800 flex items-center justify-between"
                >
                  <span>Phi phu co the phat sinh</span>
                  <i className={`fas fa-chevron-down ${feesExpanded ? 'rotate-180' : ''}`} />
                </button>
                {feesExpanded ? (
                  <div id="feesContent" className="mt-3 text-xs text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>• Phi vuot gio</span>
                      <span>50.000đ/gio</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Phi qua km</span>
                      <span>5.000đ/km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Phi ve sinh</span>
                      <span>100.000đ</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-3">Can ho tro?</p>
                <a href="tel:0236123456" className="flex items-center justify-center text-green-500 hover:text-green-600">
                  <i className="fas fa-phone-alt mr-2" />
                  <span className="font-semibold">0236 123 456</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {relatedVehicles.length > 0 ? (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Xe tuong tu</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedVehicles.map((relatedVehicle) => (
                <div key={relatedVehicle.vehicleId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <Link to={`/vehicles/${relatedVehicle.vehicleId}`} className="block">
                    <div className="relative">
                      <img
                        src={relatedVehicle.mainImageUrl || 'https://via.placeholder.com/400x224?text=No+Image'}
                        alt={relatedVehicle.vehicleModel}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                        San sang
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 truncate">{relatedVehicle.vehicleModel}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <i className="fas fa-chair mr-1" />
                        <span>{relatedVehicle.seats}</span> cho
                        <span className="mx-2">|</span>
                        <i className="fas fa-cog mr-1" />
                        <span>{relatedVehicle.transmissionTypeName || 'Tu dong'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-primary">{new Intl.NumberFormat('vi-VN').format(relatedVehicle.dailyPrice)}</span>
                          <span className="text-sm text-gray-600">₫/ngay</span>
                        </div>
                        <span className="text-primary hover:text-accent font-semibold">
                          Xem chi tiet <i className="fas fa-arrow-right ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {locationModalOpen ? (
        <div
          id="locationModal"
          className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4"
          onClick={() => setLocationModalOpen(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Dia diem giao nhan xe</h3>
              <button type="button" onClick={() => setLocationModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="option-custom" className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="option-custom"
                    name="delivery-option"
                    checked={deliveryOption === 'custom'}
                    onChange={() => setDeliveryOption('custom')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 font-semibold text-gray-800">Dia chi tuy chinh</span>
                </label>
                {deliveryOption === 'custom' ? (
                  <div className="mt-2 pl-6 space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={customAddress}
                        onChange={(event) => setCustomAddress(event.target.value)}
                        placeholder="Nhap dia chi tuy chinh"
                        className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary pl-10"
                      />
                      <i className="fas fa-search absolute left-3 top-3.5 text-gray-400" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Khu do thi FPT City, Ngu Hanh Son, Da Nang',
                        'San bay Quoc te Da Nang',
                        'Ga Da Nang',
                      ].map((address) => (
                        <button
                          key={address}
                          type="button"
                          className="suggested-location-btn"
                          onClick={() => setCustomAddress(address)}
                        >
                          {address}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Phi giao xe tuy chinh: Mien phi.</p>
                  </div>
                ) : null}
              </div>

              <div>
                <label htmlFor="option-airport" className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="option-airport"
                    name="delivery-option"
                    checked={deliveryOption === 'airport'}
                    onChange={() => setDeliveryOption('airport')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 font-semibold text-gray-800">Giao xe san bay</span>
                </label>
                {deliveryOption === 'airport' ? (
                  <div className="mt-2 space-y-2 pl-6">
                    <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="airport-location"
                        checked={airportLocation === 'San bay Quoc te Da Nang'}
                        onChange={() => setAirportLocation('San bay Quoc te Da Nang')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="ml-3">San bay Quoc te Da Nang</span>
                      <span className="ml-auto font-semibold text-primary">Mien phi</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="airport-location"
                        checked={airportLocation === 'Ga Da Nang'}
                        onChange={() => setAirportLocation('Ga Da Nang')}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="ml-3">Ga Da Nang</span>
                      <span className="ml-auto font-semibold text-primary">Mien phi</span>
                    </label>
                  </div>
                ) : null}
              </div>

              <div>
                <label htmlFor="option-free" className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="option-free"
                    name="delivery-option"
                    checked={deliveryOption === 'free'}
                    onChange={() => setDeliveryOption('free')}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 font-semibold text-gray-800">Nhan xe tai vi tri cua xe (Mien phi)</span>
                </label>
                {deliveryOption === 'free' ? (
                  <div className="mt-2 pl-6">
                    <p className="text-sm text-gray-600">Ban se nhan xe tai dia chi cua chu xe sau khi dat coc.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-sm text-gray-800">Giao xe nhan xe tan noi</h4>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Dich vu giao nhan xe tan noi</span>
                <span>trong vong 10km</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Phi giao nhan xe (2 chieu)</span>
                <span className="font-semibold">Mien phi</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUpdateLocation}
              className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors font-semibold"
            >
              Thay doi
            </button>
          </div>
        </div>
      ) : null}

      {galleryOpen ? (
        <div id="imageGalleryModal" className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex flex-col items-center justify-center p-4">
          <button type="button" onClick={() => setGalleryOpen(false)} className="absolute top-4 right-4 text-white text-3xl z-[10001]">
            &times;
          </button>
          <div className="relative w-full max-w-4xl max-h-[80vh] flex items-center justify-center">
            <img
              id="galleryMainImage"
              src={galleryImages[selectedImageIndex] || currentImage}
              alt="Gallery"
              className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              type="button"
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all text-2xl z-[10000]"
              onClick={() =>
                setSelectedImageIndex((prev) =>
                  prev === 0 ? galleryImages.length - 1 : prev - 1,
                )
              }
            >
              <i className="fas fa-chevron-left" />
            </button>
            <button
              type="button"
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all text-2xl z-[10000]"
              onClick={() =>
                setSelectedImageIndex((prev) =>
                  galleryImages.length > 0 ? (prev + 1) % galleryImages.length : 0,
                )
              }
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
          <div id="galleryThumbnails" className="mt-4 flex justify-center space-x-2 overflow-x-auto pb-2 w-full max-w-4xl flex-shrink-0">
            {galleryImages.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`border-2 rounded-md overflow-hidden ${index === selectedImageIndex ? 'border-green-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={image} alt={`thumbnail-${index + 1}`} className="h-16 w-24 object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <style>{`
      .tab-button {
        position: relative;
        padding: 1rem 1.5rem;
        color: #6b7280;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        border-bottom: 3px solid transparent;
      }
      .tab-button:hover { color: #10b981; }
      .tab-button.active { color: #4CAF50; border-bottom-color: #4CAF50; }
      .thumbnail-item.active { border-color: #10b981 !important; }
      .suggested-location-btn {
        background-color: #f3f4f6;
        border-radius: 9999px;
        padding: 6px 12px;
        font-size: 0.875rem;
        color: #4b5563;
        transition: all 0.2s;
      }
      .suggested-location-btn:hover {
        background-color: #e5e7eb;
        color: #1f2937;
      }
      `}</style>
    </main>
  );
};

export default VehicleDetailPage;
