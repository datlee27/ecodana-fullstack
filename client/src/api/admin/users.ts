/**
 * Admin Users API — CRUD operations for user management.
 * All endpoints return ApiResponse<T>; we unwrap .data here.
 */
import axiosClient from '../axios';
import type { ApiResponse } from '../../types/api';
import type { AdminUser } from '../../types/admin';

const BASE = '/admin/users/api';

export interface UserRequest {
  username: string;
  email: string;
  password?: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  roleId: string;
  status: 'Active' | 'Inactive' | 'Banned';
  gender?: string | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lockoutEnabled?: boolean;
}

export async function adminGetUsers(params?: {
  search?: string;
  role?: string;
  status?: string;
}): Promise<{ users: AdminUser[]; total: number }> {
  const res = await axiosClient.get<ApiResponse<{ users: AdminUser[]; total: number }>>(
    `${BASE}/list`,
    { params },
  );
  return res.data.data;
}

export async function adminCreateUser(payload: UserRequest): Promise<AdminUser> {
  const res = await axiosClient.post<ApiResponse<AdminUser>>(`${BASE}/create`, payload);
  return res.data.data;
}

export async function adminUpdateUser(id: string, payload: UserRequest): Promise<AdminUser> {
  const res = await axiosClient.put<ApiResponse<AdminUser>>(`${BASE}/update/${id}`, payload);
  return res.data.data;
}

export async function adminDeleteUser(id: string): Promise<void> {
  await axiosClient.delete(`${BASE}/delete/${id}`);
}

export async function adminUpdateUserStatus(
  id: string,
  status: 'Active' | 'Inactive' | 'Banned',
): Promise<AdminUser> {
  const res = await axiosClient.patch<ApiResponse<AdminUser>>(
    `${BASE}/status/${id}`,
    null,
    { params: { status } },
  );
  return res.data.data;
}

/**
 * Change only the role of a user.
 * Calls PATCH /admin/users/api/role/{id}?roleId=...
 * Backend delegates to userService.updateUserRole() which:
 *   - validates roleId via RoleService
 *   - sends Owner promotion email if role changed to Owner
 */
export async function adminUpdateUserRole(id: string, roleId: string): Promise<void> {
  await axiosClient.patch(`${BASE}/role/${id}`, null, { params: { roleId } });
}
