export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';
export type PaymentType = 'Deposit' | 'FinalPayment' | 'Surcharge' | 'Refund';

export interface Payment {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentType: PaymentType;
  transactionId?: string;
  paymentDate?: string;
  bookingId?: string;
  bookingCode?: string;
  contractCode?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  notes?: string;
  createdDate?: string;
}

export interface PaymentFilters {
  status?: PaymentStatus;
  search?: string;
}

export interface PaymentStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  refunded: number;
  totalRevenue: number; // was: totalAmount — matches backend AdminPaymentService.PaymentStats
}

