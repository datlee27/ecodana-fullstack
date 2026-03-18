import type { Vehicle } from './vehicle';

export interface OwnerMetaOption {
  id: number;
  name: string;
}

export interface OwnerVehicleMeta {
  categories: OwnerMetaOption[];
  transmissions: OwnerMetaOption[];
  vehicleStatuses: string[];
  vehicleTypes: string[];
}

export interface OwnerVehiclePayload {
  vehicleModel: string;
  yearManufactured?: number;
  licensePlate: string;
  seats: number;
  odometer?: number;
  hourlyPrice?: number;
  dailyPrice: number;
  monthlyPrice?: number;
  description?: string;
  vehicleType: string;
  requiresLicense: boolean;
  batteryCapacity?: number;
  mainImageUrl?: string;
  imageUrls?: string[];
  features?: string[];
  categoryId?: number;
  transmissionTypeId?: number;
  status?: string;
}

export interface OwnerBooking {
  bookingId: string;
  bookingCode: string;
  status: string;
  pickupDateTime: string;
  returnDateTime: string;
  pickupLocation?: string;
  paymentOption?: string;
  totalAmount: number;
  depositAmountRequired: number;
  remainingAmount: number;
  cancelReason?: string;
  createdDate?: string;
  vehicleId?: string;
  vehicleModel?: string;
  licensePlate?: string;
  vehicleMainImageUrl?: string;
  userId?: string;
  userEmail?: string;
  userPhone?: string;
  userFullName?: string;
}

export interface OwnerBookingRejectPayload {
  reason: string;
}

export interface OwnerBookingHandoverPayload {
  odometer: number;
  notes?: string;
}

export interface OwnerBookingCompletePayload {
  notes?: string;
  setMaintenance?: boolean;
}

export interface OwnerPaymentItem {
  paymentId: string;
  amount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentType?: string;
  paymentDate?: string;
  createdDate?: string;
  orderCode?: string;
  transactionId?: string;
  bookingId?: string;
  bookingCode?: string;
  bookingStatus?: string;
  vehicleModel?: string;
  licensePlate?: string;
}

export interface OwnerPaymentStats {
  totalRevenue: number;
  netRevenue: number;
}

export interface OwnerPaymentsData {
  items: OwnerPaymentItem[];
  stats: OwnerPaymentStats;
}

export interface OwnerFeedbackItem {
  feedbackId: string;
  rating: number;
  content?: string;
  reviewed?: string;
  createdDate?: string;
  staffReply?: string;
  replyDate?: string;
  bookingId?: string;
  bookingCode?: string;
  vehicleId?: string;
  vehicleModel?: string;
  userId?: string;
  userEmail?: string;
  userFullName?: string;
}

export interface OwnerBankAccountItem {
  bankAccountId: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  bankCode?: string;
  qrCodeImagePath?: string;
  isDefault: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export type OwnerVehicle = Vehicle;
