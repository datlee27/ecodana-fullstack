import axiosClient from './axios';
import type {
  AdminAnalytics,
  AdminBooking,
  AdminBookingStats,
  AdminUser,
  AdminVehicle,
} from '../types/admin';
import type { ApiResponse } from '../types/api';
import type { Vehicle } from '../types/vehicle';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
  const res = await axiosClient.get<AdminAnalytics>('/admin/api/analytics');
  const raw = res.data;

  // --- Normalize Monthly Revenue (Last 6 Months) ---
  if (Array.isArray(raw.monthlyRevenue)) {
    const rawData = raw.monthlyRevenue.map((p: any) => ({
      year: Number(p.year || p.YEAR || p.Year),
      month: Number(p.month || p.MONTH || p.Month),
      revenue: Number(p.revenue || p.REVENUE || p.Revenue || 0)
    }));
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    raw.monthlyRevenue = last6Months.map((m) => {
      const found = rawData.find((d) => d.year === m.year && d.month === m.month);
      return { label: `T${m.month}/${String(m.year).slice(2)}`, revenue: found ? found.revenue : 0 };
    });
  }

  // --- Normalize Daily Revenue (Last 7 Days) ---
  if (Array.isArray(raw.dailyRevenue)) {
    const rawData = raw.dailyRevenue.map((p: any) => ({
      date: p.date || p.DATE || p.Date,
      revenue: Number(p.revenue || p.REVENUE || p.Revenue || 0)
    }));
    const last7Days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      last7Days.push({ sqlDate: `${yyyy}-${mm}-${dd}`, display: `${dd}/${mm}` });
    }
    raw.dailyRevenue = last7Days.map((d) => {
      const found = rawData.find((r) => r.date === d.sqlDate);
      return { label: d.display, revenue: found ? found.revenue : 0 };
    });
  }

  // --- Normalize Yearly Revenue (Last 5 Years) ---
  if (Array.isArray(raw.yearlyRevenue)) {
    const rawData = raw.yearlyRevenue.map((p: any) => ({
      year: Number(p.year || p.YEAR || p.Year),
      revenue: Number(p.revenue || p.REVENUE || p.Revenue || 0)
    }));
    const last5Years = [];
    const currentYear = new Date().getFullYear();
    for (let i = 4; i >= 0; i--) {
      last5Years.push(currentYear - i);
    }
    raw.yearlyRevenue = last5Years.map((y) => {
      const found = rawData.find((r) => r.year === y);
      return { label: String(y), revenue: found ? found.revenue : 0 };
    });
  }

  // BigDecimal fields come as numbers from Jackson — cast to number to be safe
  const toNum = (v: unknown) => (v != null ? Number(v) : undefined);
  raw.totalRevenue   = toNum(raw.totalRevenue);
  raw.todayRevenue   = toNum(raw.todayRevenue);
  raw.monthRevenue   = toNum(raw.monthRevenue);

  return raw;
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const getAdminUsers = async (params?: {
  search?: string;
  status?: string;
  role?: string;
}): Promise<{ users: AdminUser[]; total: number }> => {
  const res = await axiosClient.get<ApiResponse<{ users: AdminUser[]; total: number }>>(    '/admin/users/api/list',
    { params },
  );
  return { users: res.data.data.users, total: res.data.data.total };
};

export const updateAdminUserStatus = async (
  id: string,
  status: 'Active' | 'Inactive' | 'Banned',
): Promise<AdminUser> => {
  const res = await axiosClient.patch<ApiResponse<AdminUser>>(
    `/admin/users/api/status/${id}`,
    null,
    { params: { status } },
  );
  return res.data.data;
};

export const deleteAdminUser = async (id: string): Promise<void> => {
  await axiosClient.delete(`/admin/users/api/delete/${id}`);
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const getAdminBookings = async (params?: {
  status?: string;
  search?: string;
}): Promise<AdminBooking[]> => {
  const res = await axiosClient.get<AdminBooking[]>('/admin/api/bookings', { params });
  return res.data;
};

export const getAdminBookingStats = async (): Promise<AdminBookingStats> => {
  const res = await axiosClient.get<AdminBookingStats>('/admin/api/bookings/statistics');
  return res.data;
};

export const updateAdminBookingStatus = async (
  id: string,
  status: string,
  reason?: string,
): Promise<AdminBooking> => {
  const res = await axiosClient.put<{ success: boolean; booking: AdminBooking }>(
    `/admin/api/bookings/${id}/status`,
    { status, reason },
  );
  return res.data.booking;
};

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const getAdminVehicles = async (params?: {
  search?: string;
  type?: string;
}): Promise<{ vehicles: AdminVehicle[]; total: number }> => {
  const res = await axiosClient.get<ApiResponse<Vehicle[]>>('/api/v1/vehicles', { params });
  const vehicles: AdminVehicle[] = res.data.data.map((v) => ({
    vehicleId: v.vehicleId,
    vehicleModel: v.vehicleModel,
    licensePlate: v.licensePlate ?? null,
    status: v.status ?? 'Unknown',
    vehicleType: v.vehicleType ?? null,
    mainImageUrl: v.mainImageUrl ?? null,
    ownerName: null,
    ownerEmail: null,
    dailyPrice: Number(v.dailyPrice ?? 0),
    createdDate: null,
  }));
  return { vehicles, total: vehicles.length };
};

export const approveAdminVehicle = async (vehicleId: string): Promise<void> => {
  await axiosClient.post(`/admin/api/vehicles/${vehicleId}/approve`);
};

export const rejectAdminVehicle = async (vehicleId: string, reason: string): Promise<void> => {
  await axiosClient.post(`/admin/api/vehicles/${vehicleId}/reject`, { reason });
};
