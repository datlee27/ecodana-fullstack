import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  createBooking,
  getAvailableDiscounts,
  previewCheckout,
} from '../../../api/bookingApi';
import { getVehicleDetail } from '../../../api/vehicleApi';
import type { ApiErrorResponse } from '../../../types/api';
import type {
  CheckoutPreviewData,
  DiscountOption,
} from '../../../types/booking';
import type { Vehicle } from '../../../types/vehicle';

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} ₫`;

const formatDateTime = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }
  return date.toLocaleString('vi-VN');
};

const formatDateTimeFromInputs = (date: string, time: string) => {
  if (!date || !time) return '--';
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return `${date} ${time}`;
  }
  return parsed.toLocaleString('vi-VN', {
    hour12: false,
  });
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const apiError = error.response?.data?.data as { error?: string } | undefined;
  return apiError?.error ?? error.response?.data?.message ?? fallback;
};

const BookingCheckoutPage = () => {
  const navigate = useNavigate();
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
      setError('Thieu thong tin dat xe. Vui long quay lai trang chi tiet xe va chon thue lai.');
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
        setError(getApiErrorMessage(apiError, 'Khong the tai trang checkout.'));
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
        setPreviewError(getApiErrorMessage(apiError, 'Khong the tinh toan chi phi dat xe.'));
      } finally {
        setPreviewLoading(false);
      }
    };

    void loadPreview();
  }, [
    discountCode,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    vehicle,
    vehicleId,
  ]);

  const durationText = useMemo(() => {
    if (!preview) return '--';
    const remainingHours = Number(preview.remainingHours ?? 0);
    if (remainingHours <= 0) {
      return `${preview.fullDays} ngay`;
    }
    return `${preview.fullDays} ngay ${remainingHours.toFixed(2)} gio`;
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
      window.alert('Vui long dien day du ngay gio nhan/tra xe.');
      return;
    }

    const start = new Date(`${editPickupDate}T${editPickupTime}:00`);
    const end = new Date(`${editReturnDate}T${editReturnTime}:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      window.alert('Ngay tra xe phai sau ngay nhan xe.');
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
  };

  const handleApplyDiscount = (nextCode: string) => {
    setDiscountCode(nextCode);
    syncSearchParams({ discountCode: nextCode || null });
  };

  const handleConfirmBooking = async () => {
    if (!agreeTerms) {
      window.alert('Vui long dong y dieu khoan va dieu kien truoc khi xac nhan dat xe.');
      return;
    }

    if (!vehicle || !preview) {
      window.alert('Thong tin checkout chua san sang. Vui long thu lai.');
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
      setError(getApiErrorMessage(apiError, 'Khong the tao don dat xe.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          Dang tai checkout...
        </div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error ?? 'Khong tim thay xe.'}
          </div>
          <Link
            to={vehicleId ? `/vehicles/${vehicleId}` : '/vehicles'}
            className="inline-flex items-center mt-4 text-green-600 hover:text-green-700 font-semibold"
          >
            <i className="fas fa-arrow-left mr-2" />
            Quay lai
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center text-green-500">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  <i className="fas fa-check" />
                </div>
                <span className="ml-2 font-semibold">Chon xe</span>
              </div>
              <div className="w-24 h-1 bg-green-500 mx-4" />
              <div className="flex items-center text-green-500">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <span className="ml-2 font-semibold">Xac nhan va thanh toan</span>
              </div>
              <div className="w-24 h-1 bg-gray-300 mx-4" />
              <div className="flex items-center text-gray-400">
                <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <span className="ml-2">Hoan tat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <i className="fas fa-car text-green-500 mr-2" />
                Thong tin xe
              </h2>

              <div className="flex gap-4">
                <img
                  src={vehicle.mainImageUrl || 'https://via.placeholder.com/128x128?text=No+Image'}
                  alt={vehicle.vehicleModel}
                  className="w-32 h-32 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{vehicle.vehicleModel}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-id-card w-5 mr-2" />
                      <span>
                        Bien so: <span className="font-semibold">{vehicle.licensePlate || 'N/A'}</span>
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-chair w-5 mr-2" />
                      <span>
                        So cho: <span className="font-semibold">{vehicle.seats} cho</span>
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-cog w-5 mr-2" />
                      <span>{vehicle.transmissionTypeName || 'So tu dong'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-bolt w-5 mr-2" />
                      <span>Dien</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <i className="fas fa-calendar-alt text-green-500 mr-2" />
                  Thoi gian thue
                </h2>
                <button
                  type="button"
                  onClick={() => (editMode ? handleCancelEditTime() : handleStartEditTime())}
                  className="text-green-600 hover:text-green-700 font-semibold text-sm"
                >
                  <i className="fas fa-edit mr-1" />
                  {editMode ? 'Huy' : 'Chinh sua'}
                </button>
              </div>

              {!editMode ? (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Nhan xe</p>
                      <p className="font-bold text-gray-900">
                        {preview ? formatDateTime(preview.pickupDateTime) : formatDateTimeFromInputs(pickupDate, pickupTime)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Tra xe</p>
                      <p className="font-bold text-gray-900">
                        {preview ? formatDateTime(preview.returnDateTime) : formatDateTimeFromInputs(returnDate, returnTime)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="fas fa-clock text-blue-500 mr-2" />
                      <span className="text-gray-700">
                        Thoi gian thue:{' '}
                        <span className="font-bold text-blue-600">{durationText}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nhan xe</label>
                      <input
                        type="date"
                        value={editPickupDate}
                        onChange={(event) => setEditPickupDate(event.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-2"
                      />
                      <input
                        type="time"
                        value={editPickupTime}
                        onChange={(event) => setEditPickupTime(event.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tra xe</label>
                      <input
                        type="date"
                        value={editReturnDate}
                        onChange={(event) => setEditReturnDate(event.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 mb-2"
                      />
                      <input
                        type="time"
                        value={editReturnTime}
                        onChange={(event) => setEditReturnTime(event.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEditTime}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-semibold"
                    >
                      <i className="fas fa-check mr-1" /> Luu thay doi
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditTime}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                      <i className="fas fa-times mr-1" /> Huy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold flex items-center mb-4">
                <i className="fas fa-map-marker-alt text-green-500 mr-2" />
                Dia diem giao xe
              </h2>
              <p className="text-gray-800">{pickupLocation}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold flex items-center mb-4">
                <i className="fas fa-tag text-green-500 mr-2" />
                Ma giam gia
              </h2>

              <select
                value={discountCode}
                onChange={(event) => handleApplyDiscount(event.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="">Chon hoac bo ma giam gia</option>
                {discounts.map((discount) => (
                  <option key={discount.discountId} value={discount.voucherCode}>
                    {discount.discountName} ({discount.discountType === 'Percentage'
                      ? `${discount.discountValue}%`
                      : `${new Intl.NumberFormat('vi-VN').format(discount.discountValue)} VND`})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <i className="fas fa-file-contract text-green-500 mr-2" />
                Dieu khoan va dieu kien
              </h2>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2" />
                  <span>Su dung xe dung muc dich, khong vi pham phap luat.</span>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2" />
                  <span>Khong su dung xe de cam co, the chap.</span>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2" />
                  <span>Giu gin xe sach se, khong hut thuoc trong xe.</span>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-2" />
                  <span>Tra xe dung thoi gian da thoa thuan.</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(event) => setAgreeTerms(event.target.checked)}
                    className="mt-1 mr-3 w-5 h-5 text-green-500 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Toi da doc va dong y voi Dieu khoan su dung va Chinh sach bao mat cua EcoDana.
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Tom tat don hang</h2>

              {previewLoading ? (
                <div className="text-sm text-gray-500">Dang tinh toan chi phi...</div>
              ) : null}

              {previewError ? (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {previewError}
                </div>
              ) : null}

              {preview ? (
                <>
                  <div className="space-y-3 text-sm mb-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600 font-medium">Don gia thue</span>
                        <span className="font-semibold">{formatCurrency(preview.vehicleRentalFee)}</span>
                      </div>
                      {preview.remainingHours > 0 ? (
                        <div className="text-xs text-gray-500 ml-2">
                          • {preview.fullDays} ngay × {formatCurrency(preview.dailyPrice)}
                          <br />
                          • {preview.remainingHours.toFixed(2)} gio × {formatCurrency(preview.hourlyPrice)}
                        </div>
                      ) : null}
                    </div>

                    {preview.discountAmount > 0 ? (
                      <div className="flex justify-between text-green-600">
                        <span className="font-medium">
                          <i className="fas fa-tag mr-1" />
                          Giam gia ({preview.discountCode || 'Voucher'})
                        </span>
                        <span className="font-semibold">-{formatCurrency(preview.discountAmount)}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Tong cong</span>
                      <span className="text-2xl font-bold text-green-500">{formatCurrency(preview.totalAmount)}</span>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => void handleConfirmBooking()}
                  disabled={submitting || previewLoading || !preview}
                  className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-check-circle mr-2" />
                  {submitting ? 'Dang tao don...' : 'Xac nhan dat xe'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/vehicles/${vehicle.vehicleId}`)}
                  className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <i className="fas fa-arrow-left mr-2" />
                  Quay lai
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <i className="fas fa-lock text-green-500 mr-2" />
                  <span>Thanh toan an toan va bao mat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingCheckoutPage;
