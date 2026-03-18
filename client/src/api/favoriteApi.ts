import axiosClient from './axios';
import type { ApiResponse } from '../types/api';
import type { Vehicle } from '../types/vehicle';

interface ToggleFavoritePayload {
  favorited: boolean;
  vehicleId: string;
}

export const getFavorites = async (): Promise<Vehicle[]> => {
  const response = await axiosClient.get<ApiResponse<Vehicle[]>>('/api/v1/favorites');
  return response.data.data.map((vehicle) => ({
    ...vehicle,
    hourlyPrice: Number(vehicle.hourlyPrice ?? 0),
    dailyPrice: Number(vehicle.dailyPrice ?? 0),
    monthlyPrice: Number(vehicle.monthlyPrice ?? 0),
  }));
};

export const getFavoriteIds = async (): Promise<string[]> => {
  const response = await axiosClient.get<ApiResponse<string[]>>('/api/v1/favorites/ids');
  return response.data.data;
};

export const toggleFavorite = async (vehicleId: string): Promise<ToggleFavoritePayload> => {
  const response = await axiosClient.post<ApiResponse<ToggleFavoritePayload>>(`/api/v1/favorites/toggle/${vehicleId}`);
  return response.data.data;
};
