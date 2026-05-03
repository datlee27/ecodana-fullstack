/**
 * useAdminUsers — data fetching + mutation hook for user management.
 * Replaces the inline fetch in useAdminData.ts for users.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminUpdateUserStatus,
  adminUpdateUserRole,
  type UserRequest,
} from '../../api/admin/users';
import type { AdminUser } from '../../types/admin';

interface UsersState {
  users: AdminUser[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useAdminUsersList(params: { search?: string; role?: string; status?: string }) {
  const [state, setState] = useState<UsersState>({
    users: [],
    total: 0,
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await adminGetUsers({
        search: params.search || undefined,
        role: params.role || undefined,
        status: params.status || undefined,
      });
      setState({ users: result.users, total: result.total, loading: false, error: null });
    } catch (err: unknown) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Lỗi không xác định',
      }));
    }
  }, [params.search, params.role, params.status]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}

export function useAdminUserMutations(onSuccess: () => void) {
  const [busy, setBusy] = useState(false);
  const [mutError, setMutError] = useState<string | null>(null);

  const wrap = useCallback(
    async (action: () => Promise<unknown>) => {
      setBusy(true);
      setMutError(null);
      try {
        await action();
        onSuccess();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
        setMutError(msg);
        throw new Error(msg);
      } finally {
        setBusy(false);
      }
    },
    [onSuccess],
  );

  const createUser = useCallback(
    (payload: UserRequest) => wrap(() => adminCreateUser(payload)),
    [wrap],
  );

  const updateUser = useCallback(
    (id: string, payload: UserRequest) => wrap(() => adminUpdateUser(id, payload)),
    [wrap],
  );

  const deleteUser = useCallback(
    (id: string) => wrap(() => adminDeleteUser(id)),
    [wrap],
  );

  const updateRole = useCallback(
    (id: string, roleId: string) => wrap(() => adminUpdateUserRole(id, roleId)),
    [wrap],
  );

  const updateStatus = useCallback(
    (id: string, status: 'Active' | 'Inactive' | 'Banned') =>
      wrap(() => adminUpdateUserStatus(id, status)),
    [wrap],
  );

  return { createUser, updateUser, updateRole, deleteUser, updateStatus, busy, mutError };
}
