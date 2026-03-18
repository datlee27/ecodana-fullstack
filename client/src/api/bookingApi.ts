import axiosClient from './axios';
import type { ApiResponse } from '../types/api';
import type {
  BookingCreateData,
  BookingCreateRequest,
  BookingSummary,
  CheckoutPreviewData,
  CheckoutPreviewRequest,
  DiscountOption,
  PaymentLinkData,
  PaymentReturnData,
  PaymentSummaryData,
} from '../types/booking';

const normalizeBooking = (booking: BookingSummary): BookingSummary => ({
  ...booking,
  totalAmount: Number(booking.totalAmount ?? 0),
  depositAmountRequired: Number(booking.depositAmountRequired ?? 0),
});

const normalizeCheckoutPreview = (payload: CheckoutPreviewData): CheckoutPreviewData => ({
  ...payload,
  hourlyPrice: Number(payload.hourlyPrice ?? 0),
  dailyPrice: Number(payload.dailyPrice ?? 0),
  fullDays: Number(payload.fullDays ?? 0),
  remainingHours: Number(payload.remainingHours ?? 0),
  vehicleRentalFee: Number(payload.vehicleRentalFee ?? 0),
  discountAmount: Number(payload.discountAmount ?? 0),
  totalAmount: Number(payload.totalAmount ?? 0),
});

const normalizeDiscount = (discount: DiscountOption): DiscountOption => ({
  ...discount,
  discountValue: Number(discount.discountValue ?? 0),
  minOrderAmount: Number(discount.minOrderAmount ?? 0),
  maxDiscountAmount: Number(discount.maxDiscountAmount ?? 0),
});

const normalizeBookingCreateData = (payload: BookingCreateData): BookingCreateData => ({
  ...payload,
  totalAmount: Number(payload.totalAmount ?? 0),
  depositAmount: Number(payload.depositAmount ?? 0),
  remainingAmount: Number(payload.remainingAmount ?? 0),
});

const normalizePaymentSummary = (payload: PaymentSummaryData): PaymentSummaryData => ({
  ...payload,
  totalAmount: Number(payload.totalAmount ?? 0),
  depositAmount: Number(payload.depositAmount ?? 0),
  paidAmount: Number(payload.paidAmount ?? 0),
  remainingAmount: Number(payload.remainingAmount ?? 0),
});

const normalizePaymentLinkData = (payload: PaymentLinkData): PaymentLinkData => ({
  ...payload,
  amount: Number(payload.amount ?? 0),
});

const normalizePaymentReturnData = (payload: PaymentReturnData): PaymentReturnData => ({
  ...payload,
  paidAmount: Number(payload.paidAmount ?? 0),
  totalPaid: Number(payload.totalPaid ?? 0),
  totalAmount: Number(payload.totalAmount ?? 0),
  remainingAmount: Number(payload.remainingAmount ?? 0),
});

export const getMyBookings = async (): Promise<BookingSummary[]> => {
  const response = await axiosClient.get<ApiResponse<BookingSummary[]>>('/api/v1/bookings/my-bookings');
  return response.data.data.map(normalizeBooking);
};

export const getMyActiveBookings = async (): Promise<BookingSummary[]> => {
  const response = await axiosClient.get<ApiResponse<BookingSummary[]>>('/api/v1/bookings/my-active');
  return response.data.data.map(normalizeBooking);
};

export const getBookingDetail = async (bookingId: string): Promise<BookingSummary> => {
  const response = await axiosClient.get<ApiResponse<BookingSummary>>(`/api/v1/bookings/${bookingId}`);
  return normalizeBooking(response.data.data);
};

export const previewCheckout = async (payload: CheckoutPreviewRequest): Promise<CheckoutPreviewData> => {
  const response = await axiosClient.post<ApiResponse<CheckoutPreviewData>>('/api/v1/bookings/checkout-preview', payload);
  return normalizeCheckoutPreview(response.data.data);
};

export const getAvailableDiscounts = async (): Promise<DiscountOption[]> => {
  const response = await axiosClient.get<ApiResponse<DiscountOption[]>>('/api/v1/bookings/available-discounts');
  return response.data.data.map(normalizeDiscount);
};

export const createBooking = async (payload: BookingCreateRequest): Promise<BookingCreateData> => {
  const response = await axiosClient.post<ApiResponse<BookingCreateData>>('/api/v1/bookings/create', payload);
  return normalizeBookingCreateData(response.data.data);
};

export const getBookingPaymentSummary = async (bookingId: string): Promise<PaymentSummaryData> => {
  const response = await axiosClient.get<ApiResponse<PaymentSummaryData>>(`/api/v1/bookings/${bookingId}/payment-summary`);
  return normalizePaymentSummary(response.data.data);
};

export const createBookingPaymentLink = async (bookingId: string, paymentType: 'deposit' | 'full'): Promise<PaymentLinkData> => {
  const response = await axiosClient.post<ApiResponse<PaymentLinkData>>(`/api/v1/bookings/${bookingId}/payment-link`, {
    paymentType,
  });
  return normalizePaymentLinkData(response.data.data);
};

export const confirmBookingPaymentReturn = async (payload: {
  code?: string;
  status?: string;
  cancel?: string;
  orderCode?: string;
  bookingId?: string;
}): Promise<PaymentReturnData> => {
  const response = await axiosClient.post<ApiResponse<PaymentReturnData>>('/api/v1/bookings/payment/confirm-return', payload);
  return normalizePaymentReturnData(response.data.data);
};
