import axiosClient from '../axios';
import type { ApiResponse } from '../../types/api';
import type { Payment, PaymentFilters, PaymentStats } from '../../types/admin';

const BASE_URL = '/admin/api/payments';

export async function getAdminPayments(filters?: PaymentFilters): Promise<Payment[]> {
  const res = await axiosClient.get<ApiResponse<Payment[]>>(BASE_URL, { params: filters });
  return res.data.data;
}

export async function getAdminPaymentById(id: string): Promise<Payment> {
  const res = await axiosClient.get<ApiResponse<Payment>>(`${BASE_URL}/${id}`);
  return res.data.data;
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const res = await axiosClient.get<ApiResponse<PaymentStats>>(`${BASE_URL}/statistics`);
  return res.data.data;
}

export async function updateAdminPayment(id: string, updates: Record<string, unknown>): Promise<void> {
  await axiosClient.put(`${BASE_URL}/${id}/update`, updates);
}

export async function deleteAdminPayment(id: string): Promise<void> {
  await axiosClient.delete(`${BASE_URL}/${id}`);
}

export async function markPaymentCompleted(id: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/mark-completed`);
}

export async function markPaymentFailed(id: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/mark-failed`);
}

export async function processPaymentRefund(id: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/refund`);
}
