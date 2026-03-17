export interface BookingSummary {
  bookingId: string;
  bookingCode: string;
  status: string;
  active: boolean;
  pickupDateTime: string;
  returnDateTime: string;
  pickupLocation: string;
  totalAmount: number;
  depositAmountRequired: number;
  paymentOption: string;
  rentalType: string;
  vehicleId: string;
  vehicleModel: string;
  vehicleMainImageUrl: string;
  userId: string;
  userEmail: string;
  userFullName: string;
}

export interface CheckoutPreviewRequest {
  vehicleId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  discountCode?: string;
}

export interface CheckoutPreviewData {
  vehicleId: string;
  vehicleModel: string;
  hourlyPrice: number;
  dailyPrice: number;
  fullDays: number;
  remainingHours: number;
  vehicleRentalFee: number;
  discountCode?: string | null;
  discountAmount: number;
  totalAmount: number;
  pickupDateTime: string;
  returnDateTime: string;
}

export interface DiscountOption {
  discountId: number;
  discountName: string;
  voucherCode: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
}

export interface BookingCreateRequest {
  vehicleId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  pickupLocation: string;
  discountCode?: string;
  paymentMethod?: 'DEPOSIT' | 'FULL';
}

export interface BookingCreateData {
  bookingId: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
}

export interface PaymentSummaryData {
  bookingId: string;
  bookingCode: string;
  status: string;
  vehicleModel: string;
  vehicleMainImageUrl: string;
  licensePlate: string;
  pickupDateTime: string;
  returnDateTime: string;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface PaymentLinkData {
  bookingId: string;
  paymentType: 'deposit' | 'full';
  amount: number;
  checkoutUrl: string;
}

export interface PaymentReturnData {
  success: boolean;
  warning?: boolean;
  error?: boolean;
  message: string;
  bookingId: string;
  bookingCode: string;
  paidAmount?: number;
  totalPaid?: number;
  totalAmount?: number;
  remainingAmount?: number;
  status?: string;
}
