import axiosClient from './axios';
import type { ApiResponse } from '../types/api';
import type { BookingSummary } from '../types/booking';

const normalizeBooking = (booking: BookingSummary): BookingSummary => ({
  ...booking,
  totalAmount: Number(booking.totalAmount ?? 0),
  depositAmountRequired: Number(booking.depositAmountRequired ?? 0),
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
