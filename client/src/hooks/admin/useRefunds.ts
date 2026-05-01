import { useCallback, useEffect, useState } from 'react';
import {
  getAdminRefunds,
  getPendingRefunds,
  getRefundById,
  approveRefund,
  rejectRefund,
  markRefundTransferred,
  markRefundCompleted,
  uploadTransferProof,
  getRefundStats,
} from '../../api/admin';
import type { RefundRequest, RefundFilters, RefundStats } from '../../types/admin';

interface UseRefundsResult {
  data: RefundRequest[] | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminRefunds(filters?: RefundFilters): UseRefundsResult {
  const [data, setData] = useState<RefundRequest[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminRefunds(filters);
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

export function usePendingRefunds() {
  const [data, setData] = useState<RefundRequest[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPendingRefunds());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRefund(id: string | null) {
  const [data, setData] = useState<RefundRequest | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getRefundById(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRefundMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(async (id: string, adminNotes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await approveRefund(id, adminNotes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reject = useCallback(async (id: string, adminNotes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await rejectRefund(id, adminNotes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markTransferred = useCallback(async (id: string, transferProofImagePath?: string) => {
    setLoading(true);
    setError(null);
    try {
      await markRefundTransferred(id, transferProofImagePath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markCompleted = useCallback(async (id: string, transferProofImagePath?: string) => {
    setLoading(true);
    setError(null);
    try {
      await markRefundCompleted(id, transferProofImagePath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProof = useCallback(async (file: File, refundRequestId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await uploadTransferProof(file, refundRequestId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { approve, reject, markTransferred, markCompleted, uploadProof, loading, error };
}

export function useRefundStats() {
  const [data, setData] = useState<RefundStats | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRefundStats();
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
