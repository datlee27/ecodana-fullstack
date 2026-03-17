export interface Vehicle {
  vehicleId: string;
  vehicleModel: string;
  yearManufactured: number;
  seats: number;
  hourlyPrice: number;
  dailyPrice: number;
  monthlyPrice: number;
  status: string;
  vehicleType: string;
  requiresLicense: boolean;
  mainImageUrl: string;
  categoryName: string;
  transmissionTypeName: string;
}

export interface VehicleQueryParams {
  location?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  category?: string;
  vehicleType?: string;
  budget?: string;
  seats?: number;
  requiresLicense?: boolean;
}
