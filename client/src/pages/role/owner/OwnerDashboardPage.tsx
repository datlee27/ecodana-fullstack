import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { getOwnerBookings, getOwnerVehicles } from '../../../api/ownerApi';
import { Badge, DataTable, EmptyState, PageHeader } from '../../../design-system';
import type { DataTableColumn } from '../../../design-system/components/DataTable';
import { BookingStatCard } from '../../../features/vehicle/BookingStatCard';
import type { OwnerBooking, OwnerVehicle } from '../../../types/owner';

const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} d`;

const getBookingStatusTone = (status?: string) => {
  switch (status) {
    case 'Completed':
      return 'success' as const;
    case 'Pending':
    case 'AwaitingDeposit':
    case 'RefundPending':
      return 'warning' as const;
    case 'Rejected':
    case 'Cancelled':
      return 'danger' as const;
    case 'Confirmed':
    case 'Ongoing':
    case 'Approved':
      return 'info' as const;
    default:
      return 'neutral' as const;
  }
};

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

  const columns: Array<DataTableColumn<OwnerBooking>> = [
    {
      key: 'code',
      header: 'Code',
      render: (booking) => <span className="font-semibold text-text-strong">{booking.bookingCode}</span>,
    },
    {
      key: 'customer',
      header: 'Khach hang',
      render: (booking) => booking.userFullName || 'Chua cap nhat',
    },
    {
      key: 'vehicle',
      header: 'Xe',
      render: (booking) => booking.vehicleModel || 'Chua cap nhat',
    },
    {
      key: 'amount',
      header: 'Tong tien',
      align: 'right',
      render: (booking) => <span className="font-semibold text-text-strong">{formatCurrency(booking.totalAmount)}</span>,
    },
    {
      key: 'status',
      header: 'Trang thai',
      render: (booking) => (
        <Badge tone={getBookingStatusTone(booking.status)} size="md">
          {booking.status}
        </Badge>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Owner portal"
        title="Tong quan chu xe"
        description="Theo doi doi xe, booking dang xu ly va tinh hinh van hanh trong mot man hinh."
        actions={
          <div className="flex gap-2">
            <Link to="/owner/vehicles" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
              Quan ly xe
            </Link>
            <Link to="/owner/bookings" className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-strong transition-colors hover:bg-muted">
              Quan ly booking
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-6">
        <BookingStatCard label="Tong xe" value={stats.totalVehicles} tone="slate" />
        <BookingStatCard label="Xe san sang" value={stats.available} tone="emerald" />
        <BookingStatCard label="Xe bao tri/sac" value={stats.maintenance} tone="amber" />
        <BookingStatCard label="Cho duyet" value={stats.pendingApproval} tone="amber" />
        <BookingStatCard label="Don cho xu ly" value={stats.pendingBookings} tone="amber" />
        <BookingStatCard label="Chuyen dang thue" value={stats.ongoingBookings} tone="emerald" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-strong">Booking gan day</h2>
            <p className="text-sm text-text-muted">Danh sach booking moi nhat de theo doi nhanh trang thai va tong tien.</p>
          </div>
          <Link to="/owner/bookings" className="text-sm font-semibold text-primary transition-colors hover:text-primary-hover">
            Xem tat ca
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <EmptyState title="Chua co booking nao" description="Khi co don dat xe moi, danh sach gan day se hien thi tai day." />
        ) : (
          <DataTable columns={columns} rows={recentBookings} getRowKey={(booking) => booking.bookingId} />
        )}
      </section>
    </section>
  );
};

export default OwnerDashboardPage;
