import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getFavoriteIds, toggleFavorite } from '../api/favoriteApi';
import { getVehicles } from '../api/vehicleApi';
import { useAuth } from '../hooks/useAuth';
import type { VehicleQueryParams, Vehicle } from '../types/vehicle';

const statusUi: Record<string, string> = {
  AVAILABLE: 'bg-green-500 text-white',
  RENTED: 'bg-yellow-500 text-white',
  MAINTENANCE: 'bg-red-500 text-white',
};

const statusText: Record<string, string> = {
  AVAILABLE: 'San sang',
  RENTED: 'Da thue',
  MAINTENANCE: 'Bao tri',
};

const VehicleListPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilters = useMemo(
    () => ['location', 'pickupDate', 'returnDate', 'pickupTime', 'returnTime', 'category', 'vehicleType', 'budget', 'seats', 'requiresLicense']
      .some((key) => {
        const value = searchParams.get(key);
        return value !== null && value !== '';
      }),
    [searchParams],
  );

  useEffect(() => {
    setFilterOpen(activeFilters);
  }, [activeFilters]);

  const filterValues = useMemo(
    () => ({
      location: searchParams.get('location') ?? '',
      pickupDate: searchParams.get('pickupDate') ?? '',
      returnDate: searchParams.get('returnDate') ?? '',
      vehicleType: searchParams.get('vehicleType') ?? '',
      category: searchParams.get('category') ?? '',
      budget: searchParams.get('budget') ?? '',
      seats: searchParams.get('seats') ?? '',
      requiresLicense: searchParams.get('requiresLicense') ?? '',
    }),
    [searchParams],
  );

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: VehicleQueryParams = {};
      const entries = Object.fromEntries(searchParams.entries());

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
      setError('Khong the tai danh sach xe. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, searchParams]);

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  const onApplyFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      const text = value.toString().trim();
      if (text !== '') {
        params.set(key, text);
      }
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
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
      // ignore
    }
  };

  return (
    <main className="pt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Kham pha cac dong xe dien</h1>
          <p className="mt-4 text-xl text-gray-600">Lua chon phuong tien hoan hao cho chuyen di cua ban tai Da Nang.</p>
        </div>

        <div className="mb-8">
          <button
            id="filter-toggle-btn"
            className="bg-white p-3 rounded-lg shadow-md text-gray-700 font-semibold flex items-center justify-between w-full md:w-auto"
            onClick={() => setFilterOpen((prev) => !prev)}
          >
            <span><i className="fas fa-filter mr-2" /> Bo loc</span>
            <i className={`fas fa-chevron-down ml-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>

          {filterOpen ? (
            <div id="filter-options" className="mt-4 bg-white p-6 rounded-lg shadow-md">
              <form onSubmit={onApplyFilter} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Dia diem</label>
                  <input defaultValue={filterValues.location} type="text" name="location" id="location" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>

                <div>
                  <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700">Ngay nhan</label>
                  <input defaultValue={filterValues.pickupDate} type="date" name="pickupDate" id="pickupDate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>

                <div>
                  <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">Ngay tra</label>
                  <input defaultValue={filterValues.returnDate} type="date" name="returnDate" id="returnDate" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>

                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Loai xe</label>
                  <select defaultValue={filterValues.vehicleType} name="vehicleType" id="vehicleType" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <option value="">Tat ca</option>
                    <option value="ElectricCar">Xe o to dien</option>
                    <option value="ElectricMotorcycle">Xe may dien</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Nhu cau</label>
                  <select defaultValue={filterValues.category} name="category" id="category" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <option value="">Tat ca</option>
                    <option value="Cong viec, di lai">Cong viec, di lai</option>
                    <option value="Gia dinh">Gia dinh</option>
                    <option value="Tiep khach, du tiec">Tiep khach, du tiec</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Ngan sach</label>
                  <select defaultValue={filterValues.budget} name="budget" id="budget" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <option value="">Tat ca</option>
                    <option value="under500k">Duoi 500 nghin</option>
                    <option value="over500k">Tren 500 nghin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="seats" className="block text-sm font-medium text-gray-700">So cho</label>
                  <select defaultValue={filterValues.seats} name="seats" id="seats" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <option value="">Tat ca</option>
                    <option value="2">2 cho</option>
                    <option value="4">4 cho</option>
                    <option value="5">5 cho</option>
                    <option value="7">7 cho</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="requiresLicense" className="block text-sm font-medium text-gray-700">Yeu cau bang lai</label>
                  <select defaultValue={filterValues.requiresLicense} name="requiresLicense" id="requiresLicense" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <option value="">Tat ca</option>
                    <option value="true">Co yeu cau</option>
                    <option value="false">Khong yeu cau</option>
                  </select>
                </div>

                <div className="col-span-full flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={clearFilters} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Xoa bo loc</button>
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-accent">Ap dung</button>
                </div>
              </form>
            </div>
          ) : null}
        </div>

        {loading ? <div className="text-center py-12">Dang tai...</div> : null}
        {error ? <div className="text-center py-12 text-red-600">{error}</div> : null}

        {!loading && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => {
              const statusKey = (vehicle.status || '').toUpperCase();
              const favorited = favoriteIds.includes(vehicle.vehicleId);

              return (
                <div key={vehicle.vehicleId} className="bg-white rounded-lg shadow-md overflow-hidden card-hover">
                  <div className="relative">
                    <img src={vehicle.mainImageUrl || 'https://via.placeholder.com/400x224?text=No+Image'} alt={vehicle.vehicleModel} className="w-full h-56 object-cover" />
                    <div className={`absolute top-0 right-0 px-3 py-1 m-2 rounded-md text-sm font-medium ${statusUi[statusKey] || 'bg-gray-500 text-white'}`}>
                      {statusText[statusKey] || vehicle.status}
                    </div>

                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => void onToggleFavorite(vehicle.vehicleId)}
                        className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                      >
                        <i className={`${favorited ? 'fas text-red-500' : 'far text-gray-600'} fa-heart`} />
                      </button>
                    ) : null}
                  </div>
                  <div className="p-6">
                    <div className="flex items-baseline mb-2">
                      <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 rounded-full uppercase font-semibold tracking-wide">
                        {vehicle.vehicleType === 'ElectricCar' ? 'O to dien' : 'Xe may dien'}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 leading-tight truncate">{vehicle.vehicleModel}</h4>
                    <div className="mt-1 text-gray-600 text-sm">
                      <i className="fas fa-chair mr-1" /> {vehicle.seats} cho <span className="mx-2">|</span>
                      <i className="fas fa-cog mr-1" /> So tu dong
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
              );
            })}

            {vehicles.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12">
                <i className="fas fa-car-side text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">Khong tim thay xe nao</h3>
                <p className="text-gray-500 mt-2">Vui long thu lai voi bo loc khac.</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default VehicleListPage;
