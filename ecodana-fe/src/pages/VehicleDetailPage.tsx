import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getVehicleDetail } from '../api/vehicleApi';
import { useAuth } from '../hooks/useAuth';
import type { Vehicle } from '../types/vehicle';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicle = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getVehicleDetail(id);
        setVehicle(data);
      } catch {
        setError('Khong the tai chi tiet xe.');
      } finally {
        setLoading(false);
      }
    };

    void loadVehicle();
  }, [id]);

  if (loading) {
    return <main className="pt-20 pb-16"><div className="max-w-7xl mx-auto px-4">Dang tai...</div></main>;
  }

  if (error || !vehicle) {
    return <main className="pt-20 pb-16"><div className="max-w-7xl mx-auto px-4 text-red-600">{error || 'Khong tim thay xe'}</div></main>;
  }

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/vehicles" className="text-primary hover:text-accent font-medium">
            <i className="fas fa-arrow-left mr-2" /> Quay lai danh sach xe
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <img src={vehicle.mainImageUrl || 'https://via.placeholder.com/1000x600?text=No+Image'} alt={vehicle.vehicleModel} className="w-full h-[420px] object-cover" />
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900">{vehicle.vehicleModel}</h1>
              <p className="text-gray-600 mt-2">{vehicle.categoryName || vehicle.vehicleType}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Loai xe</p>
                  <p className="font-semibold">{vehicle.vehicleType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">So cho</p>
                  <p className="font-semibold">{vehicle.seats} cho</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Truyen dong</p>
                  <p className="font-semibold">{vehicle.transmissionTypeName || 'Tu dong'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Bang lai</p>
                  <p className="font-semibold">{vehicle.requiresLicense ? 'Can bang lai' : 'Khong can bang lai'}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-xl shadow-md p-6 h-fit">
            <p className="text-sm text-gray-500">Gia theo ngay</p>
            <p className="text-3xl font-bold text-primary mt-1">{new Intl.NumberFormat('vi-VN').format(vehicle.dailyPrice)} ₫</p>

            <button
              type="button"
              className="w-full mt-6 bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-accent transition-all"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: `/vehicles/${vehicle.vehicleId}` } });
                  return;
                }

                navigate('/booking/my-bookings');
              }}
            >
              Dat xe ngay
            </button>

            <p className="text-xs text-gray-500 mt-3">
              Flow dat xe chi tiet se tiep tuc duoc dong bo 1:1 voi giao dien cu trong buoc tiep theo.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default VehicleDetailPage;
