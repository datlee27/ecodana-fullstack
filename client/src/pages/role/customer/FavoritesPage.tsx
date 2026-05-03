import { ArrowRight, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, toggleFavorite } from '../../../api/favoriteApi';
import { PageContainer, PageHeader } from '../../../design-system';
import { VehicleGrid } from '../../../features/vehicle/VehicleGrid';
import type { Vehicle } from '../../../types/vehicle';

const FavoritesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFavorites();
      setVehicles(data);
    } catch {
      setError('Không thể tải danh sách yêu thích.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFavorites();
  }, []);

  const removeFavorite = async (vehicleId: string) => {
    try {
      await toggleFavorite(vehicleId);
      setVehicles((prev) => prev.filter((vehicle) => vehicle.vehicleId !== vehicleId));
    } catch {
      setError('Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.');
    }
  };

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="space-y-8 py-10">
        <PageHeader
          eyebrow="Tài khoản"
          title="Danh sách yêu thích"
          description="Lưu lại các xe bạn quan tâm để so sánh và quay lại đặt thuê nhanh hơn."
          actions={
            <Link to="/vehicles" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted">
              Khám phá xe
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <VehicleGrid
          vehicles={vehicles}
          loading={loading}
          error={error}
          favoriteIds={vehicles.map((vehicle) => vehicle.vehicleId)}
          showFavorite
          onToggleFavorite={(vehicleId) => void removeFavorite(vehicleId)}
          onRetry={() => void loadFavorites()}
          emptyTitle="Chưa có xe yêu thích"
          emptyDescription="Hãy đánh dấu yêu thích để lưu lại các xe bạn quan tâm."
        />

        {!loading && !error && vehicles.length === 0 ? (
          <div className="flex justify-center">
            <Link to="/vehicles" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
              <Heart className="h-4 w-4" aria-hidden="true" />
              Tìm xe để lưu
            </Link>
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
};

export default FavoritesPage;
