import axiosClient from './axios';
import type { ApiResponse } from '../types/api';
import type {
  OwnerBankAccountItem,
  OwnerBooking,
  OwnerBookingCompletePayload,
  OwnerBookingHandoverPayload,
  OwnerBookingRejectPayload,
  OwnerFeedbackItem,
  OwnerPaymentsData,
  OwnerVehicle,
  OwnerVehicleMeta,
  OwnerVehiclePayload,
} from '../types/owner';

const toNumber = (value: unknown): number => Number(value ?? 0);

const normalizeVehicle = (vehicle: OwnerVehicle): OwnerVehicle => ({
  ...vehicle,
  hourlyPrice: toNumber(vehicle.hourlyPrice),
  dailyPrice: toNumber(vehicle.dailyPrice),
  monthlyPrice: toNumber(vehicle.monthlyPrice),
  batteryCapacity: vehicle.batteryCapacity != null ? toNumber(vehicle.batteryCapacity) : undefined,
});

const normalizeBooking = (booking: OwnerBooking): OwnerBooking => ({
  ...booking,
  totalAmount: toNumber(booking.totalAmount),
  depositAmountRequired: toNumber(booking.depositAmountRequired),
  remainingAmount: toNumber(booking.remainingAmount),
});

const normalizePayment = (payment: OwnerPaymentsData['items'][number]): OwnerPaymentsData['items'][number] => ({
  ...payment,
  amount: toNumber(payment.amount),
});

export const getOwnerMeta = async (): Promise<OwnerVehicleMeta> => {
  const response = await axiosClient.get<ApiResponse<{
    categories: Array<{ categoryId: number; categoryName: string }>;
    transmissions: Array<{ transmissionTypeId: number; transmissionTypeName: string }>;
    vehicleStatuses: string[];
    vehicleTypes: string[];
  }>>('/api/v1/owner/metadata');

  return {
    categories: response.data.data.categories.map((item) => ({
      id: item.categoryId,
      name: item.categoryName,
    })),
    transmissions: response.data.data.transmissions.map((item) => ({
      id: item.transmissionTypeId,
      name: item.transmissionTypeName,
    })),
    vehicleStatuses: response.data.data.vehicleStatuses,
    vehicleTypes: response.data.data.vehicleTypes,
  };
};

export const getOwnerVehicles = async (): Promise<OwnerVehicle[]> => {
  const response = await axiosClient.get<ApiResponse<OwnerVehicle[]>>('/api/v1/owner/vehicles');
  return response.data.data.map(normalizeVehicle);
};

export const createOwnerVehicle = async (payload: OwnerVehiclePayload): Promise<OwnerVehicle> => {
  const response = await axiosClient.post<ApiResponse<OwnerVehicle>>('/api/v1/owner/vehicles', payload);
  return normalizeVehicle(response.data.data);
};

export const updateOwnerVehicle = async (vehicleId: string, payload: OwnerVehiclePayload): Promise<OwnerVehicle> => {
  const response = await axiosClient.put<ApiResponse<OwnerVehicle>>(`/api/v1/owner/vehicles/${vehicleId}`, payload);
  return normalizeVehicle(response.data.data);
};

export const updateOwnerVehicleStatus = async (vehicleId: string, status: string): Promise<void> => {
  await axiosClient.patch(`/api/v1/owner/vehicles/${vehicleId}/status`, { status });
};

export const deleteOwnerVehicle = async (vehicleId: string): Promise<void> => {
  await axiosClient.delete(`/api/v1/owner/vehicles/${vehicleId}`);
};

export const getOwnerBookings = async (): Promise<OwnerBooking[]> => {
  const response = await axiosClient.get<ApiResponse<OwnerBooking[]>>('/api/v1/owner/bookings');
  return response.data.data.map(normalizeBooking);
};

export const approveOwnerBooking = async (bookingId: string): Promise<OwnerBooking> => {
  const response = await axiosClient.post<ApiResponse<OwnerBooking>>(`/api/v1/owner/bookings/${bookingId}/approve`);
  return normalizeBooking(response.data.data);
};

export const rejectOwnerBooking = async (bookingId: string, payload: OwnerBookingRejectPayload): Promise<OwnerBooking> => {
  const response = await axiosClient.post<ApiResponse<OwnerBooking>>(`/api/v1/owner/bookings/${bookingId}/reject`, payload);
  return normalizeBooking(response.data.data);
};

export const handoverOwnerBooking = async (bookingId: string, payload: OwnerBookingHandoverPayload): Promise<OwnerBooking> => {
  const response = await axiosClient.post<ApiResponse<OwnerBooking>>(`/api/v1/owner/bookings/${bookingId}/handover`, payload);
  return normalizeBooking(response.data.data);
};

export const completeOwnerBooking = async (bookingId: string, payload: OwnerBookingCompletePayload): Promise<OwnerBooking> => {
  const response = await axiosClient.post<ApiResponse<OwnerBooking>>(`/api/v1/owner/bookings/${bookingId}/complete`, payload);
  return normalizeBooking(response.data.data);
};

export const getOwnerPayments = async (): Promise<OwnerPaymentsData> => {
  const response = await axiosClient.get<ApiResponse<{
    items: OwnerPaymentsData['items'];
    stats: OwnerPaymentsData['stats'];
  }>>('/api/v1/owner/payments');

  return {
    items: response.data.data.items.map(normalizePayment),
    stats: {
      totalRevenue: toNumber(response.data.data.stats.totalRevenue),
      netRevenue: toNumber(response.data.data.stats.netRevenue),
    },
  };
};

export const getOwnerFeedback = async (): Promise<OwnerFeedbackItem[]> => {
  const response = await axiosClient.get<ApiResponse<OwnerFeedbackItem[]>>('/api/v1/owner/feedback');
  return response.data.data.map((item) => ({
    ...item,
    rating: toNumber(item.rating),
  }));
};

export const getOwnerBankAccounts = async (): Promise<OwnerBankAccountItem[]> => {
  const response = await axiosClient.get<ApiResponse<OwnerBankAccountItem[]>>('/api/v1/owner/bank-accounts');
  return response.data.data;
};
