import { useCallback, useEffect, useState } from 'react';
import { getAdminContracts, getAdminContractById } from '../../api/admin';
import type { Contract, ContractFilters } from '../../types/admin';

interface UseContractsResult {
  data: Contract[] | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminContracts(filters?: ContractFilters): UseContractsResult {
  const [data, setData] = useState<Contract[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminContracts(filters);
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

export function useAdminContract(id: string | null) {
  const [data, setData] = useState<Contract | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminContractById(id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
