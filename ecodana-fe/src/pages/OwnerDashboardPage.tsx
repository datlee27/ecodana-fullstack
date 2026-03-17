import { AddVehicleModal } from '../features/vehicle/AddVehicleModal';
import { BookingStatCard } from '../features/vehicle/BookingStatCard';
import { VehicleTable } from '../features/vehicle/VehicleTable';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { useVehicles } from '../hooks/useVehicles';

const OwnerDashboardPage = () => {
  const { vehicles, loading, error, refetch } = useVehicles();

  if (loading) {
    return <LoadingState message="Đang tải dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void refetch()} />;
  }

  const available = vehicles.filter((vehicle) => vehicle.status?.toUpperCase() === 'AVAILABLE').length;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Owner Dashboard</h1>
          <p className="text-sm text-slate-600">Ví dụ tách component: `VehicleTable`, `AddVehicleModal`, `BookingStatCard`.</p>
        </div>
        <AddVehicleModal />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BookingStatCard label="Tổng xe" value={vehicles.length} tone="slate" />
        <BookingStatCard label="Xe sẵn sàng" value={available} tone="emerald" />
        <BookingStatCard label="Xe không sẵn sàng" value={vehicles.length - available} tone="amber" />
      </div>

      {vehicles.length > 0 ? <VehicleTable vehicles={vehicles} /> : <EmptyState message="Bạn chưa có xe nào." />}
    </section>
  );
};

export default OwnerDashboardPage;
