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
