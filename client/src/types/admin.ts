// ─── Admin domain types ───────────────────────────────────────────────────────

// Re-export new modular types
export * from './admin/index';

// ── Users ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  status: 'Active' | 'Inactive' | 'Banned';
  gender: string | null;
  roleName: string | null;
  roleId: string | null;
  createdDate: string | null;
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUser[];
  total: number;
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export interface AdminBooking {
  bookingId: string;
  bookingCode: string;
  userId: string | null;
  vehicleId: string | null;
  pickupDateTime: string | null;
  returnDateTime: string | null;
  pickupLocation: string | null;
  totalAmount: number | null;
  status: string | null;
  rentalType: string | null;
  expectedPaymentMethod: string | null;
  cancelReason: string | null;
  createdDate: string | null;
  // joined fields
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  vehicleModel: string | null;
  licensePlate: string | null;
  handledByName: string | null;
}

export interface AdminBookingStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

// ── Vehicles ──────────────────────────────────────────────────────────────────
export interface AdminVehicle {
  vehicleId: string;
  vehicleModel: string;
  licensePlate: string | null;
  status: string;
  vehicleType: string | null;
  mainImageUrl: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  dailyPrice: number | null;
  createdDate: string | null;
}

// ── Analytics (dashboard) ─────────────────────────────────────────────────────
export interface RevenuePoint {
  label: string;  // e.g. "T1/25", "20/05", "2025"
  revenue: number;
}

export interface AdminAnalytics {
  totalUsers?: number;
  totalVehicles?: number;
  totalBookings?: number;
  totalRevenue?: number;
  pendingApprovals?: number;
  newUsersToday?: number;
  bookingsToday?: number;
  // Extended fields from backend AnalyticsService
  todayRevenue?: number;
  monthRevenue?: number;
  revenueGrowth?: number;
  pendingBookings?: number;
  activeBookings?: number;
  cancelledBookings?: number;
  availableVehicles?: number;
  inUseVehicles?: number;
  dailyRevenue?: RevenuePoint[];
  monthlyRevenue?: RevenuePoint[];
  yearlyRevenue?: RevenuePoint[];
  [key: string]: unknown;
}
