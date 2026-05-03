/**
 * useAdminData — shared hook for all admin page data fetching.
 *
 * Pattern: parallel fetch on mount, search/filter re-fetches via debounced state.
 * Follows Section 1 (eliminate waterfalls) from react-best-practices skill.
 */
import { useCallback, useEffect, useState } from 'react';
import type { AdminAnalytics, AdminBooking, AdminBookingStats, AdminUser, AdminVehicle } from '../types/admin';
import {
  getAdminAnalytics,
  getAdminBookings,
  getAdminBookingStats,
  getAdminUsers,
  getAdminVehicles,
} from '../api/adminApi';

// ─── Generic async hook ───────────────────────────────────────────────────────
function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData]       = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { void run(); }, [run]);

  return { data, loading, error, refetch: run };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const useAdminAnalytics = () =>
  useAsync<AdminAnalytics>(getAdminAnalytics);

// ─── Users ────────────────────────────────────────────────────────────────────
export function useAdminUsers(search: string, role: string, status: string) {
  return useAsync(
    () => getAdminUsers({ search: search || undefined, role: role || undefined, status: status || undefined }),
    [search, role, status],
  );
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export function useAdminBookings(status: string, search: string) {
  return useAsync<AdminBooking[]>(
    () => getAdminBookings({ status: status || undefined, search: search || undefined }),
    [status, search],
  );
}

export const useAdminBookingStats = () =>
  useAsync<AdminBookingStats>(getAdminBookingStats);

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export function useAdminVehicles(search: string, type: string) {
  return useAsync(
    () => getAdminVehicles({ search: search || undefined, type: type || undefined }),
    [search, type],
  );
}

// ─── Debounce util ────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
