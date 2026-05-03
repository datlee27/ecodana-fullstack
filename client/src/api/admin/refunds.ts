import axiosClient from '../axios';
import type { ApiResponse } from '../../types/api';
import type { RefundRequest, RefundFilters, RefundStats } from '../../types/admin';

const BASE_URL = '/admin/api/refund-requests';

export async function getAdminRefunds(filters?: RefundFilters): Promise<RefundRequest[]> {
  const res = await axiosClient.get<ApiResponse<RefundRequest[]>>(BASE_URL, { params: filters });
  return res.data.data;
}

export async function getPendingRefunds(): Promise<RefundRequest[]> {
  const res = await axiosClient.get<ApiResponse<RefundRequest[]>>(`${BASE_URL}/pending`);
  return res.data.data;
}

export async function getRefundById(id: string): Promise<RefundRequest> {
  const res = await axiosClient.get<ApiResponse<RefundRequest>>(`${BASE_URL}/${id}`);
  return res.data.data;
}

export async function approveRefund(id: string, adminNotes?: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/approve`, null, { params: { adminNotes } });
}

export async function rejectRefund(id: string, adminNotes?: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/reject`, null, { params: { adminNotes } });
}

export async function markRefundTransferred(id: string, transferProofImagePath?: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/mark-transferred`, null, { params: { transferProofImagePath } });
}

export async function markRefundCompleted(id: string, transferProofImagePath?: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/mark-completed`, null, { params: { transferProofImagePath } });
}

export async function uploadTransferProof(file: File, refundRequestId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('refundRequestId', refundRequestId);
  const res = await axiosClient.post<ApiResponse<{ imageUrl: string }>>(
    `${BASE_URL}/upload-transfer-proof`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data.data.imageUrl;
}

export async function getRefundStats(): Promise<RefundStats> {
  const res = await axiosClient.get<ApiResponse<RefundStats>>(`${BASE_URL}/statistics`);
  return res.data.data;
}
