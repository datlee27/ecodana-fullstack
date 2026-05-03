export interface VehicleSearchValues {
  location: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  category: string;
  vehicleType: string;
  budget: string;
  seats: string;
  requiresLicense: string;
}

export const emptyVehicleSearchValues: VehicleSearchValues = {
  location: '',
  pickupDate: '',
  returnDate: '',
  pickupTime: '09:00',
  returnTime: '11:00',
  category: '',
  vehicleType: '',
  budget: '',
  seats: '',
  requiresLicense: '',
};
