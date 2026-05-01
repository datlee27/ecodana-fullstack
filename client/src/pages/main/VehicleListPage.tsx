import { Filter, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFavoriteIds, toggleFavorite } from '../../api/favoriteApi';
import { getVehicles } from '../../api/vehicleApi';
import { Button, PageContainer, PageHeader } from '../../design-system';
import { VehicleSearchPanel } from '../../features/vehicle/VehicleSearchPanel';
import { VehicleGrid } from '../../features/vehicle/VehicleGrid';
import { emptyVehicleSearchValues, type VehicleSearchValues } from '../../features/vehicle/vehicleSearchValues';
import { useAuth } from '../../hooks/useAuth';
import type { Vehicle, VehicleQueryParams } from '../../types/vehicle';

const filterKeys: Array<keyof VehicleSearchValues> = [
  'location',
  'pickupDate',
  'returnDate',
  'pickupTime',
  'returnTime',
  'category',
  'vehicleType',
  'budget',
  'seats',
  'requiresLicense',
];

const readValuesFromSearchParams = (searchParams: URLSearchParams): VehicleSearchValues => ({
  ...emptyVehicleSearchValues,
  location: searchParams.get('location') ?? '',
  pickupDate: searchParams.get('pickupDate') ?? '',
  returnDate: searchParams.get('returnDate') ?? '',
  pickupTime: searchParams.get('pickupTime') ?? '09:00',
  returnTime: searchParams.get('returnTime') ?? '11:00',
  category: searchParams.get('category') ?? '',
  vehicleType: searchParams.get('vehicleType') ?? '',
  budget: searchParams.get('budget') ?? '',
  seats: searchParams.get('seats') ?? '',
  requiresLicense: searchParams.get('requiresLicense') ?? '',
});

const buildQueryParams = (values: VehicleSearchValues) => {
  const params = new URLSearchParams();
  filterKeys.forEach((key) => {
    const value = values[key].trim();
    if (value) params.set(key, value);
  });
  return params;
};

const VehicleListPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(true);
  const [filterValues, setFilterValues] = useState<VehicleSearchValues>(() => readValuesFromSearchParams(searchParams));

  const activeFilters = useMemo(
    () =>
      filterKeys.some((key) => {
        const value = searchParams.get(key);
        return value !== null && value !== '';
      }),
    [searchParams],
  );

  useEffect(() => {
    setFilterValues(readValuesFromSearchParams(searchParams));
    if (activeFilters) setFilterOpen(true);
  }, [activeFilters, searchParams]);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const entries = Object.fromEntries(searchParams.entries());
      const params: VehicleQueryParams = {};

      if (entries.location) params.location = entries.location;
      if (entries.pickupDate) params.pickupDate = entries.pickupDate;
      if (entries.returnDate) params.returnDate = entries.returnDate;
      if (entries.pickupTime) params.pickupTime = entries.pickupTime;
      if (entries.returnTime) params.returnTime = entries.returnTime;
      if (entries.category) params.category = entries.category;
      if (entries.vehicleType) params.vehicleType = entries.vehicleType;
      if (entries.budget) params.budget = entries.budget;
      if (entries.seats) params.seats = Number(entries.seats);
      if (entries.requiresLicense) params.requiresLicense = entries.requiresLicense === 'true';

      const data = await getVehicles(params);
      setVehicles(data);

      if (isAuthenticated) {
        const favoriteData = await getFavoriteIds();
        setFavoriteIds(favoriteData);
      } else {
        setFavoriteIds([]);
      }
    } catch {
      setError('Không thể tải danh sách xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, searchParams]);

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  const applyFilters = () => {
    setSearchParams(buildQueryParams(filterValues));
  };

  const clearFilters = () => {
    setFilterValues(emptyVehicleSearchValues);
    setSearchParams(new URLSearchParams());
  };

  const onToggleFavorite = async (vehicleId: string) => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const result = await toggleFavorite(vehicleId);
      setFavoriteIds((prev) =>
        result.favorited ? Array.from(new Set([...prev, vehicleId])) : prev.filter((id) => id !== vehicleId),
      );
    } catch {
      // Favorite errors are non-blocking for browsing.
    }
  };

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="space-y-8 py-10">
        <PageHeader
          eyebrow="EcoDana"
          title="Khám phá các dòng xe điện"
          description="Tìm kiếm, lọc và so sánh xe theo thời gian thuê, loại xe, số chỗ và yêu cầu bằng lái."
          actions={
            <Button
              type="button"
              variant="outline"
              leftIcon={<Filter className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setFilterOpen((prev) => !prev)}
            >
              {filterOpen ? 'Ẩn bộ lọc' : 'Mở bộ lọc'}
            </Button>
          }
        />

        {filterOpen ? (
          <VehicleSearchPanel
            values={filterValues}
            onChange={setFilterValues}
            onSubmit={applyFilters}
            onClear={clearFilters}
            showAdvanced
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            {loading ? 'Đang tải xe...' : `${vehicles.length} xe phù hợp`}
            {activeFilters ? ' theo bộ lọc hiện tại' : ''}
          </p>
          <Button
            type="button"
            variant="ghost"
            leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}
            onClick={() => void loadVehicles()}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        <VehicleGrid
          vehicles={vehicles}
          loading={loading}
          error={error}
          favoriteIds={favoriteIds}
          showFavorite={isAuthenticated}
          onToggleFavorite={(vehicleId) => void onToggleFavorite(vehicleId)}
          onRetry={() => void loadVehicles()}
          emptyTitle="Không tìm thấy xe nào"
          emptyDescription="Vui lòng thử lại với bộ lọc khác hoặc xóa bộ lọc hiện tại."
        />
      </PageContainer>
    </section>
  );
};

export default VehicleListPage;
