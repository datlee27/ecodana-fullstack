import axiosClient from '../axios';
import type { Discount, DiscountFilters, DiscountStats } from '../../types/admin';

const BASE_URL = '/admin/api/discounts';

export async function getAdminDiscounts(filters?: DiscountFilters): Promise<Discount[]> {
  const res = await axiosClient.get<Discount[]>(BASE_URL, { params: filters });
  return res.data;
}

export async function getAdminDiscountById(id: string): Promise<Discount> {
  const res = await axiosClient.get<Discount>(`${BASE_URL}/${id}`);
  return res.data;
}

export async function getDiscountStats(): Promise<DiscountStats> {
  const res = await axiosClient.get<DiscountStats>(`${BASE_URL}/statistics`);
  return res.data;
}

export async function createDiscount(discount: Omit<Discount, 'discountId'>): Promise<Discount> {
  const res = await axiosClient.post<Discount>(BASE_URL, discount);
  return res.data;
}

export async function updateDiscount(id: string, discount: Partial<Discount>): Promise<Discount> {
  const res = await axiosClient.put<Discount>(`${BASE_URL}/${id}`, discount);
  return res.data;
}

export async function deleteDiscount(id: string): Promise<void> {
  await axiosClient.delete(`${BASE_URL}/${id}`);
}

export async function toggleDiscountStatus(id: string): Promise<void> {
  await axiosClient.post(`${BASE_URL}/${id}/toggle-status`);
}
