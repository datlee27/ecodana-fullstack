import { ArrowRight, BatteryCharging, Leaf, MapPin, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVehicles } from '../../api/vehicleApi';
import { Badge, Button, PageContainer, PageHeader } from '../../design-system';
import { VehicleSearchPanel } from '../../features/vehicle/VehicleSearchPanel';
import { VehicleGrid } from '../../features/vehicle/VehicleGrid';
import { emptyVehicleSearchValues, type VehicleSearchValues } from '../../features/vehicle/vehicleSearchValues';
import type { Vehicle } from '../../types/vehicle';

const buildVehicleQuery = (values: VehicleSearchValues) => {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value.trim()) {
      query.set(key, value.trim());
    }
  });
  return query;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchValues, setSearchValues] = useState<VehicleSearchValues>(emptyVehicleSearchValues);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  const loadFeaturedVehicles = useCallback(async () => {
    setFeaturedLoading(true);
    setFeaturedError(null);

    try {
      const data = await getVehicles();
      setFeaturedVehicles(data.slice(0, 8));
    } catch {
      setFeaturedVehicles([]);
      setFeaturedError('Không thể tải danh sách xe nổi bật. Vui lòng thử lại.');
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeaturedVehicles();
  }, [loadFeaturedVehicles]);

  const performSearch = () => {
    const query = buildVehicleQuery(searchValues);
    navigate(query.toString() ? `/vehicles?${query.toString()}` : '/vehicles');
  };

  return (
    <div className="bg-canvas">
      <section className="border-b border-border bg-surface">
        <PageContainer className="pb-14 pt-8 lg:pb-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <Badge tone="primary" size="md" className="gap-2">
                <Leaf className="h-4 w-4" aria-hidden="true" />
                Di chuyển xanh tại Đà Nẵng
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight text-text-strong sm:text-5xl">
                  Tìm và đặt xe điện dễ dàng cho mọi hành trình
                </h1>
                <p className="max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
                  EcoDana giúp bạn chọn xe điện phù hợp, kiểm tra tình trạng xe và bắt đầu đặt thuê trong một luồng rõ ràng.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-text-base sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <BatteryCharging className="h-5 w-5 text-primary" aria-hidden="true" />
                  Xe điện sẵn sàng
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <MapPin className="h-5 w-5 text-info" aria-hidden="true" />
                  Nhận xe linh hoạt
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
                  <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
                  Quy trình rõ ràng
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-muted shadow-card">
              <img src="/images/tripview.png" alt="Ứng dụng thuê xe điện EcoDana" className="aspect-[16/11] h-full w-full object-cover" />
            </div>
          </div>

          <VehicleSearchPanel
            values={searchValues}
            onChange={setSearchValues}
            onSubmit={performSearch}
            onClear={() => setSearchValues(emptyVehicleSearchValues)}
            variant="hero"
            className="mt-8"
          />
        </PageContainer>
      </section>

      <section className="bg-canvas">
        <PageContainer className="space-y-8 py-12">
          <PageHeader
            eyebrow="Cách hoạt động"
            title="Ba bước để bắt đầu chuyến đi"
            description="Luồng đặt xe được giữ ngắn gọn để bạn có thể so sánh xe, chọn thời gian và xác nhận chi phí trước khi thanh toán."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Chọn xe', description: 'Tìm theo khu vực, ngày thuê, loại xe và nhu cầu sử dụng.' },
              { title: 'Xem chi phí', description: 'Kiểm tra giá thuê, ưu đãi hợp lệ và điều kiện nhận xe.' },
              { title: 'Xác nhận', description: 'Hoàn tất đặt xe và theo dõi trạng thái trong lịch sử đặt xe.' },
            ].map((item, index) => (
              <div key={item.title} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-text-strong">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="bg-surface">
        <PageContainer className="space-y-8 py-12">
          <PageHeader
            eyebrow="Xe nổi bật"
            title="Các lựa chọn xe điện đang hiển thị"
            description="Dữ liệu xe được tải trực tiếp từ hệ thống, kèm trạng thái, thông tin cơ bản và giá thuê theo ngày."
            actions={
              <Link to="/vehicles" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted">
                Xem tất cả
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />

          <VehicleGrid
            vehicles={featuredVehicles}
            loading={featuredLoading}
            error={featuredError}
            onRetry={() => void loadFeaturedVehicles()}
            emptyTitle="Chưa có xe nổi bật"
            emptyDescription="Vui lòng quay lại sau để xem các lựa chọn mới."
            columns={4}
          />

          <div className="flex justify-center">
            <Button type="button" size="lg" onClick={() => navigate('/vehicles')} rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Khám phá xe phù hợp
            </Button>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default HomePage;
