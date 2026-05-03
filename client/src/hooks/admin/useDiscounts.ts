import { useCallback, useEffect, useState } from 'react';
import {
  getAdminDiscounts,
  getAdminDiscountById,
  getDiscountStats,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from '../../api/admin';
import type { Discount, DiscountFilters, DiscountStats } from '../../types/admin';

interface UseDiscountsResult {
  data: Discount[] | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminDiscounts(filters?: DiscountFilters): UseDiscountsResult {
  const [data, setData] = useState<Discount[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminDiscounts(filters);
      setData(Array.isArray(result) ? result : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [filters?.isActive, filters?.search]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useAdminDiscount(id: string | null) {
  const [data, setData] = useState<Discount | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminDiscountById(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDiscountStats() {
  const [data, setData] = useState<DiscountStats | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDiscountStats();
      setData(result && typeof result === 'object' ? result : undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useDiscountMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (discount: Omit<Discount, 'discountId'>) => {
    setLoading(true);
    setError(null);
    try {
      return await createDiscount(discount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, discount: Partial<Discount>) => {
    setLoading(true);
    setError(null);
    try {
      return await updateDiscount(id, discount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDiscount(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, remove, loading, error };
}
