import axiosClient from './axios';
import type { ApiResponse } from '../types/api';
import type { Vehicle, VehicleQueryParams } from '../types/vehicle';

const normalizeVehicle = (vehicle: Vehicle): Vehicle => ({
  ...vehicle,
  hourlyPrice: Number(vehicle.hourlyPrice ?? 0),
  dailyPrice: Number(vehicle.dailyPrice ?? 0),
  monthlyPrice: Number(vehicle.monthlyPrice ?? 0),
});

export const getVehicles = async (params?: VehicleQueryParams): Promise<Vehicle[]> => {
  const response = await axiosClient.get<ApiResponse<Vehicle[]>>('/api/v1/vehicles', { params });
  return response.data.data.map(normalizeVehicle);
};

export const getVehicleDetail = async (vehicleId: string): Promise<Vehicle> => {
  const response = await axiosClient.get<ApiResponse<Vehicle>>(`/api/v1/vehicles/${vehicleId}`);
  return normalizeVehicle(response.data.data);
};
