export type ContractStatus = 'Draft' | 'Signed' | 'Completed' | 'Cancelled';

export interface Contract {
  contractId: string;
  contractCode: string;
  status: ContractStatus;
  createdDate: string;
  signedDate?: string;
  completedDate?: string;
  termsAccepted?: boolean;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  bookingCode?: string;
  totalAmount?: number;
  vehicleModel?: string;
  licensePlate?: string;
  notes?: string;
  cancellationReason?: string;
}

export interface ContractFilters {
  status?: ContractStatus;
  search?: string;
}
