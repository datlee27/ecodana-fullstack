import { useCallback, useEffect, useState } from 'react';
import { getAdminPayments, getAdminPaymentById, getPaymentStats } from '../../api/admin';
import type { Payment, PaymentFilters, PaymentStats } from '../../types/admin';

interface UsePaymentsResult {
  data: Payment[] | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminPayments(filters?: PaymentFilters): UsePaymentsResult {
  const [data, setData] = useState<Payment[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminPayments(filters);
      setData(Array.isArray(result) ? result : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.search]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useAdminPayment(id: string | null) {
  const [data, setData] = useState<Payment | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminPaymentById(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function usePaymentStats() {
  const [data, setData] = useState<PaymentStats | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPaymentStats();
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
