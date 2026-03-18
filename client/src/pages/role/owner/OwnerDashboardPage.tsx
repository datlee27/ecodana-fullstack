import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { getOwnerBookings, getOwnerVehicles } from '../../../api/ownerApi';
import { BookingStatCard } from '../../../features/vehicle/BookingStatCard';
import type { OwnerBooking, OwnerVehicle } from '../../../types/owner';

const OwnerDashboardPage = () => {
  const [vehicles, setVehicles] = useState<OwnerVehicle[]>([]);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehicleData, bookingData] = await Promise.all([getOwnerVehicles(), getOwnerBookings()]);
      setVehicles(vehicleData);
      setBookings(bookingData);
    } catch {
      setError('Khong the tai dashboard owner. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (loading) {
    return <LoadingState message="Dang tai owner dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadData()} />;
  }

  const available = vehicles.filter((vehicle) => vehicle.status?.toUpperCase() === 'AVAILABLE').length;
  const maintenance = vehicles.filter((vehicle) => vehicle.status?.toUpperCase() === 'MAINTENANCE').length;
  const pendingApproval = vehicles.filter((vehicle) => vehicle.status?.toUpperCase() === 'PENDINGAPPROVAL').length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length;
  const ongoingBookings = bookings.filter((booking) => booking.status === 'Ongoing').length;
  const stats = {
    totalVehicles: vehicles.length,
    available,
    maintenance,
    pendingApproval,
    pendingBookings,
    ongoingBookings,
  };

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdDate ?? '').getTime() - new Date(a.createdDate ?? '').getTime())
    .slice(0, 6);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Owner Dashboard</h1>
          <p className="text-sm text-slate-600">Tong quan ve xe, don dat, va trang thai van hanh.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/owner/vehicles" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Quan ly xe
          </Link>
          <Link to="/owner/bookings" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Quan ly booking
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <BookingStatCard label="Tong xe" value={stats.totalVehicles} tone="slate" />
        <BookingStatCard label="Xe san sang" value={stats.available} tone="emerald" />
        <BookingStatCard label="Xe bao tri/sac" value={stats.maintenance} tone="amber" />
        <BookingStatCard label="Cho duyet" value={stats.pendingApproval} tone="amber" />
        <BookingStatCard label="Don cho xu ly" value={stats.pendingBookings} tone="amber" />
        <BookingStatCard label="Chuyen dang thue" value={stats.ongoingBookings} tone="emerald" />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Booking gan day</h2>
          <Link to="/owner/bookings" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Xem tat ca
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <EmptyState message="Chua co booking nao cho xe cua ban." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Code</th>
                  <th className="px-3 py-2 font-semibold">Khach</th>
                  <th className="px-3 py-2 font-semibold">Xe</th>
                  <th className="px-3 py-2 font-semibold">Tong tien</th>
                  <th className="px-3 py-2 font-semibold">Trang thai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td className="px-3 py-2 text-slate-800">{booking.bookingCode}</td>
                    <td className="px-3 py-2 text-slate-700">{booking.userFullName || 'N/A'}</td>
                    <td className="px-3 py-2 text-slate-700">{booking.vehicleModel || 'N/A'}</td>
                    <td className="px-3 py-2 text-slate-700">{new Intl.NumberFormat('vi-VN').format(booking.totalAmount)} đ</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

export default OwnerDashboardPage;
