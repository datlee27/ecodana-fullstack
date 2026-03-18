import type { UserProfile } from '../types/user';

export const normalizeRole = (role?: string | null): string => {
  return (role ?? '').trim().toLowerCase();
};

export const getRoleHomePath = (user: UserProfile | null): string => {
  const role = normalizeRole(user?.role);

  if (role === 'admin') return '/admin';
  if (role === 'owner') return '/owner/dashboard';
  if (role === 'staff') return '/staff';
  return '/';
};
