import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../../../api/bookingApi';
import { Button, EmptyState, PageContainer, PageHeader, Skeleton, cn } from '../../../design-system';
import { CustomerBookingCard } from '../../../features/booking';
import type { BookingSummary } from '../../../types/booking';

const tabs = [
  { key: 'all', label: 'Tất cả', statuses: [] as string[] },
  { key: 'Pending', label: 'Chờ duyệt', statuses: ['Pending'] },
  { key: 'AwaitingDeposit,Approved', label: 'Chờ thanh toán', statuses: ['AwaitingDeposit', 'Approved'] },
  { key: 'Confirmed', label: 'Đã thanh toán', statuses: ['Confirmed'] },
  { key: 'Ongoing', label: 'Đang thuê', statuses: ['Ongoing'] },
  { key: 'Completed', label: 'Hoàn thành', statuses: ['Completed'] },
  { key: 'RefundPending', label: 'Đang hủy', statuses: ['RefundPending'] },
  { key: 'Cancelled,Rejected', label: 'Đã hủy/Từ chối', statuses: ['Cancelled', 'Rejected'] },
  { key: 'Refunded', label: 'Đã hoàn tiền', statuses: ['Refunded'] },
];

const BookingListSkeleton = () => {
  return (
    <div className="space-y-4" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      setError('Không thể tải danh sách đặt xe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const currentTab = tabs.find((tab) => tab.key === activeTab);
    if (!currentTab || currentTab.statuses.length === 0) {
      return bookings;
    }

    return bookings.filter((booking) => currentTab.statuses.includes(booking.status));
  }, [activeTab, bookings]);

  const countByTab = (statuses: string[]) => {
    if (statuses.length === 0) return bookings.length;
    return bookings.filter((booking) => statuses.includes(booking.status)).length;
  };

  return (
    <section className="bg-canvas pb-16">
      <PageContainer className="space-y-8 py-10">
        <PageHeader
          eyebrow="Tài khoản"
          title="Đơn đặt xe của tôi"
          description="Theo dõi lịch sử đặt xe, trạng thái thanh toán và các chuyến đang diễn ra."
          actions={
            <Button type="button" onClick={() => void loadBookings()} loading={loading} leftIcon={<RefreshCw className="h-4 w-4" aria-hidden="true" />}>
              Làm mới
            </Button>
          }
        />

        {error ? <EmptyState tone="danger" title="Không thể tải danh sách đặt xe" description={error} /> : null}

        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <div className="flex min-w-max">
            {tabs.map((tab) => {
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={cn(
                    'border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
                    selected ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-primary',
                  )}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} ({countByTab(tab.statuses)})
                </button>
              );
            })}
          </div>
        </div>

        {loading ? <BookingListSkeleton /> : null}

        {!loading && !error && filteredBookings.length === 0 ? (
          <EmptyState
            title="Chưa có đơn đặt xe"
            description="Hãy bắt đầu thuê xe để trải nghiệm dịch vụ của EcoDana."
            action={
              <Link to="/vehicles" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                Thuê xe ngay
              </Link>
            }
          />
        ) : null}

        {!loading && filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <CustomerBookingCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        ) : null}
      </PageContainer>
    </section>
  );
};

export default MyBookingsPage;
