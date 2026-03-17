import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { confirmBookingPaymentReturn } from '../../../api/bookingApi';
import type { ApiErrorResponse } from '../../../types/api';
import type { PaymentReturnData } from '../../../types/booking';

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} ₫`;

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
        setError('Khong co thong tin giao dich de xac nhan thanh toan.');
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
        setError(getApiErrorMessage(apiError, 'Khong the xac nhan ket qua thanh toan.'));
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

  return (
    <section className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-indigo-500 to-fuchsia-700 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-[20px] shadow-2xl p-8 text-center">
          {loading ? (
            <div className="py-12">
              <i className="fas fa-spinner fa-spin text-3xl text-gray-500 mb-4" />
              <p className="text-gray-600">Dang xac nhan ket qua thanh toan...</p>
            </div>
          ) : null}

          {!loading && error ? (
            <div>
              <div className="w-24 h-24 mx-auto rounded-full bg-red-500 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                <i className="fas fa-times text-4xl text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-red-500 mb-4">Thanh toan that bai</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {displayBookingId ? (
                  <Link
                    to={`/booking/payment/${displayBookingId}`}
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
                  >
                    <i className="fas fa-redo mr-2" />
                    Thu lai
                  </Link>
                ) : null}
                <Link
                  to="/booking/my-bookings"
                  className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold"
                >
                  <i className="fas fa-arrow-left mr-2" />
                  Quay lai
                </Link>
              </div>
            </div>
          ) : null}

          {!loading && !error && result ? (
            <>
              <div
                className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
                  viewType === 'success'
                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                    : viewType === 'warning'
                      ? 'bg-amber-500 shadow-lg shadow-amber-500/30'
                      : 'bg-red-500 shadow-lg shadow-red-500/30'
                }`}
              >
                <i
                  className={`text-4xl text-white ${
                    viewType === 'success'
                      ? 'fas fa-check'
                      : viewType === 'warning'
                        ? 'fas fa-exclamation'
                        : 'fas fa-times'
                  }`}
                />
              </div>

              <h1
                className={`text-3xl font-extrabold mb-4 ${
                  viewType === 'success'
                    ? 'text-green-500'
                    : viewType === 'warning'
                      ? 'text-amber-500'
                      : 'text-red-500'
                }`}
              >
                {viewType === 'success'
                  ? 'Thanh toan thanh cong!'
                  : viewType === 'warning'
                    ? 'Da huy thanh toan'
                    : 'Thanh toan that bai'}
              </h1>

              <p className="text-gray-600 mb-8">{result.message}</p>

              {viewType === 'success' && (result.paidAmount ?? 0) > 0 ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    So tien da thanh toan
                  </div>
                  <div className="text-4xl font-extrabold text-green-600">
                    {formatCurrency(result.paidAmount ?? 0)}
                  </div>
                </div>
              ) : null}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-500">Ma don hang</span>
                  <span className="text-sm font-bold text-gray-900">{result.bookingCode}</span>
                </div>
                {displayOrderCode ? (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-500">Ma giao dich</span>
                    <span className="text-sm font-bold text-gray-900">{displayOrderCode}</span>
                  </div>
                ) : null}
                {viewType === 'success' && (result.totalAmount ?? 0) > 0 ? (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-500">Tong tien don</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(result.totalAmount ?? 0)}</span>
                  </div>
                ) : null}
                {viewType === 'success' && (result.remainingAmount ?? 0) >= 0 ? (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-semibold text-gray-500">Con lai</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(result.remainingAmount ?? 0)}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {viewType === 'success' && displayBookingId ? (
                  <Link
                    to={`/booking/confirmation/${displayBookingId}`}
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold"
                  >
                    <i className="fas fa-check-circle mr-2" />
                    Xem chi tiet don hang
                  </Link>
                ) : null}

                {(viewType === 'error' || viewType === 'warning') && displayBookingId ? (
                  <Link
                    to={`/booking/payment/${displayBookingId}`}
                    className={`inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold ${
                      viewType === 'warning'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-red-500 hover:bg-red-600'
                    }`}
                  >
                    <i className="fas fa-redo mr-2" />
                    Thanh toan lai
                  </Link>
                ) : null}

                <Link
                  to="/booking/my-bookings"
                  className={`inline-flex items-center px-6 py-3 rounded-lg border-2 font-semibold ${
                    viewType === 'warning'
                      ? 'border-amber-600 text-amber-700 hover:bg-amber-50'
                      : 'border-green-500 text-green-600 hover:bg-green-50'
                  }`}
                >
                  <i className="fas fa-list mr-2" />
                  Xem tat ca don hang
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default PaymentReturnPage;
