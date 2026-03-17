import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, toggleFavorite } from '../../../api/favoriteApi';
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
      setError('Khong the tai danh sach yeu thich.');
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
      // ignore
    }
  };

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sach yeu thich</h1>
          <p className="text-gray-600">Nhung dong xe ban da danh dau yeu thich</p>
        </div>

        {loading ? <div className="bg-white rounded-lg shadow-md p-12 text-center">Dang tai...</div> : null}
        {error ? <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">{error}</div> : null}

        {!loading && vehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="far fa-heart text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chua co xe yeu thich</h3>
            <p className="text-gray-500 mb-6">Hay danh dau yeu thich de luu lai cac xe ban quan tam.</p>
            <Link to="/vehicles" className="inline-block bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all">
              Kham pha xe
            </Link>
          </div>
        ) : null}

        {!loading && vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <div key={vehicle.vehicleId} className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
                <div className="relative">
                  <img src={vehicle.mainImageUrl || 'https://via.placeholder.com/400x224?text=No+Image'} alt={vehicle.vehicleModel} className="w-full h-56 object-cover" />
                  <button
                    type="button"
                    onClick={() => void removeFavorite(vehicle.vehicleId)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                  >
                    <i className="fas fa-heart text-red-500" />
                  </button>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 leading-tight truncate">{vehicle.vehicleModel}</h4>
                  <div className="mt-1 text-gray-600 text-sm">
                    <i className="fas fa-chair mr-1" /> {vehicle.seats} cho
                  </div>

                  <div className="mt-4">
                    <span className="text-2xl font-bold text-primary">{new Intl.NumberFormat('vi-VN').format(vehicle.dailyPrice)}</span>
                    <span className="text-sm text-gray-600"> / ngay</span>
                  </div>

                  <div className="mt-6">
                    <Link to={`/vehicles/${vehicle.vehicleId}`} className="w-full text-center block bg-primary text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                      Xem chi tiet
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default FavoritesPage;
