import axiosClient from './axios';
import type { ApiResponse } from '../types/api';
import type { AuthPayload, LoginRequest, RegisterRequest } from '../types/auth';
import type { UserProfile } from '../types/user';

export const login = async (payload: LoginRequest): Promise<AuthPayload> => {
  try {
    const response = await axiosClient.post<ApiResponse<AuthPayload>>('/api/v1/auth/login', payload);
    return response.data.data;
  } catch (err: unknown) {
    // Extract message from API response (e.g. banned account = 403 with message)
    const apiMessage =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    throw new Error(apiMessage ?? 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
  }
};

export const register = async (payload: RegisterRequest): Promise<AuthPayload> => {
  const response = await axiosClient.post<ApiResponse<AuthPayload>>('/api/v1/auth/register', payload);
  return response.data.data;
};

export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await axiosClient.get<ApiResponse<UserProfile>>('/api/v1/profile/me');
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await axiosClient.post('/api/v1/auth/logout');
};
