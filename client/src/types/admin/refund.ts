export type RefundStatus = 'Pending' | 'Rejected' | 'Refunded';

export interface BankAccountInfo {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountHolder: string;
  qrCodeImagePath?: string;
}

export interface RefundRequest {
  refundRequestId: string;
  refundAmount: number;
  status: RefundStatus;
  cancelReason: string;
  adminNotes?: string;
  createdDate: string;
  processedDate?: string;
  isWithinTwoHours: boolean;
  transferProofImagePath?: string;
  bookingId?: string;
  bookingCode?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bankAccount?: BankAccountInfo;
}

export interface RefundFilters {
  status?: RefundStatus;
  search?: string;
}

export interface RefundStats {
  total: number;
  pending: number;
  refunded: number;
  rejected: number;
  urgent: number;
  totalPendingAmount: number;
}
