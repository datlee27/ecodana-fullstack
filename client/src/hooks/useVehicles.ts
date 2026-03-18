import { useCallback, useEffect, useState } from 'react';
import { getVehicles } from '../api/vehicleApi';
import type { Vehicle } from '../types/vehicle';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch {
      setError('Không thể tải danh sách xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    refetch: fetchVehicles,
  };
};
