import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createBookingPaymentLink,
  getBookingPaymentSummary,
} from '../api/bookingApi';
import type { ApiErrorResponse } from '../types/api';
import type { PaymentSummaryData } from '../types/booking';

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} ₫`;

const formatDateTime = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }
  return date.toLocaleString('vi-VN');
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const apiError = error.response?.data?.data as { error?: string } | undefined;
  return apiError?.error ?? error.response?.data?.message ?? fallback;
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
        setError('Khong tim thay booking de thanh toan.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getBookingPaymentSummary(bookingId);
        setSummary(data);
      } catch (apiError) {
        setError(getApiErrorMessage(apiError, 'Khong the tai thong tin thanh toan.'));
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

  const handlePay = async (paymentType: 'deposit' | 'full') => {
    if (!bookingId) return;
    setError(null);
    setProcessingType(paymentType);
    try {
      const data = await createBookingPaymentLink(bookingId, paymentType);
      if (!data.checkoutUrl) {
        throw new Error('Khong nhan duoc link thanh toan PayOS.');
      }
      window.location.assign(data.checkoutUrl);
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Khong the tao link thanh toan.'));
      setProcessingType(null);
    }
  };

  if (loading) {
    return (
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">Dang tai trang thanh toan...</div>
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            {error ?? 'Khong tim thay thong tin thanh toan.'}
          </div>
          <Link
            to="/booking/my-bookings"
            className="inline-flex items-center mt-4 text-green-600 hover:text-green-700 font-semibold"
          >
            <i className="fas fa-arrow-left mr-2" />
            Quay lai lich su dat xe
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toan dat xe</h1>
          <p className="text-gray-600">
            Ma dat xe:{' '}
            <span className="font-semibold text-green-600">{summary.bookingCode}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <i className="fas fa-info-circle text-green-500 mr-2" />
            Thong tin dat xe
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Thong tin xe</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <i className="fas fa-car text-gray-400 w-5 mr-2" />
                  <span className="text-gray-600">Xe:</span>
                  <span className="ml-auto font-semibold">{summary.vehicleModel}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-id-card text-gray-400 w-5 mr-2" />
                  <span className="text-gray-600">Bien so:</span>
                  <span className="ml-auto font-semibold">{summary.licensePlate || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Thoi gian thue</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <i className="fas fa-calendar-check text-gray-400 w-5 mr-2" />
                  <span className="text-gray-600">Nhan xe:</span>
                  <span className="ml-auto font-semibold">{formatDateTime(summary.pickupDateTime)}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-calendar-times text-gray-400 w-5 mr-2" />
                  <span className="text-gray-600">Tra xe:</span>
                  <span className="ml-auto font-semibold">{formatDateTime(summary.returnDateTime)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Tong tien:</span>
              <span className="text-2xl font-bold text-green-500">{formatCurrency(summary.totalAmount)}</span>
            </div>
            {summary.paidAmount > 0 ? (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Da thanh toan:</span>
                <span className="font-semibold text-green-600">{formatCurrency(summary.paidAmount)}</span>
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        ) : null}

        {summary.remainingAmount <= 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="font-semibold text-green-800 mb-3">Booking nay da duoc thanh toan day du.</p>
            <Link
              to={`/booking/confirmation/${summary.bookingId}`}
              className="inline-flex items-center bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              <i className="fas fa-check-circle mr-2" />
              Xem chi tiet don hang
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-credit-card text-green-500 mr-2" />
              Chon phuong thuc thanh toan
            </h2>

            <div className="space-y-4">
              <div className="border-2 border-green-500 rounded-lg p-6 hover:bg-green-50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <i className="fas fa-hand-holding-usd text-green-500 mr-2" />
                      Thanh toan coc 20%
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">Dat coc truoc, thanh toan phan con lai khi nhan xe.</p>
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700">Thanh toan ngay:</span>
                        <span className="font-bold text-green-600">{formatCurrency(depositNeedToPay)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Thanh toan khi nhan xe:</span>
                        <span className="font-semibold text-gray-600">{formatCurrency(summary.remainingAmount - depositNeedToPay)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={processingType !== null || depositNeedToPay <= 0}
                  onClick={() => void handlePay('deposit')}
                  className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-lock mr-2" />
                  {processingType === 'deposit' ? 'Dang tao link...' : 'Thanh toan coc qua PayOS'}
                </button>
              </div>

              <div className="border-2 border-blue-500 rounded-lg p-6 hover:bg-blue-50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      <i className="fas fa-check-circle text-blue-500 mr-2" />
                      Thanh toan toan bo 100%
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">Thanh toan mot lan, khong can thanh toan them khi nhan xe.</p>
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Thanh toan ngay:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(summary.remainingAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={processingType !== null}
                  onClick={() => void handlePay('full')}
                  className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-all shadow-md flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-lock mr-2" />
                  {processingType === 'full' ? 'Dang tao link...' : 'Thanh toan toan bo qua PayOS'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <i className="fas fa-shield-alt text-blue-500 text-2xl mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Thanh toan an toan va bao mat</h3>
              <p className="text-sm text-blue-800">Giao dich duoc bao mat boi PayOS - cong thanh toan truc tuyen hien dai.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/booking/my-bookings"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-semibold"
          >
            <i className="fas fa-arrow-left mr-2" />
            Quay lai lich su dat xe
          </Link>
        </div>
      </div>
    </main>
  );
};

export default BookingPaymentPage;
