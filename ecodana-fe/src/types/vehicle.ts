export interface Vehicle {
  vehicleId: string;
  vehicleModel: string;
  yearManufactured: number;
  licensePlate?: string;
  seats: number;
  odometer?: number;
  hourlyPrice: number;
  dailyPrice: number;
  monthlyPrice: number;
  status: string;
  description?: string;
  vehicleType: string;
  requiresLicense: boolean;
  batteryCapacity?: number;
  createdDate?: string;
  mainImageUrl: string;
  imageUrls?: string[];
  features?: string[];
  categoryName: string;
  categoryId?: number;
  transmissionTypeName: string;
  transmissionTypeId?: number;
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
