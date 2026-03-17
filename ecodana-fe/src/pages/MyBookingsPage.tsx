import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../api/bookingApi';
import type { BookingSummary } from '../types/booking';

const tabs = [
  { key: 'all', label: 'Tat ca', statuses: [] as string[] },
  { key: 'Pending', label: 'Cho duyet', statuses: ['Pending'] },
  { key: 'AwaitingDeposit,Approved', label: 'Cho thanh toan', statuses: ['AwaitingDeposit', 'Approved'] },
  { key: 'Confirmed', label: 'Da thanh toan', statuses: ['Confirmed'] },
  { key: 'Ongoing', label: 'Dang thue', statuses: ['Ongoing'] },
  { key: 'Completed', label: 'Hoan thanh', statuses: ['Completed'] },
  { key: 'RefundPending', label: 'Huy chuyen', statuses: ['RefundPending'] },
  { key: 'Cancelled,Rejected', label: 'Da huy/Tu choi', statuses: ['Cancelled', 'Rejected'] },
  { key: 'Refunded', label: 'Da hoan tien', statuses: ['Refunded'] },
];

const statusBadge: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-blue-100 text-blue-800',
  AwaitingDeposit: 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-green-100 text-green-800',
  Ongoing: 'bg-green-100 text-green-800',
  Completed: 'bg-gray-100 text-gray-800',
  RefundPending: 'bg-orange-100 text-orange-800',
  Refunded: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Rejected: 'bg-red-100 text-red-800',
};

const statusText: Record<string, string> = {
  Pending: 'Cho duyet',
  Approved: 'Da duyet',
  AwaitingDeposit: 'Cho thanh toan',
  Confirmed: 'Da thanh toan',
  Ongoing: 'Dang thue',
  Completed: 'Hoan thanh',
  RefundPending: 'Huy chuyen',
  Refunded: 'Da hoan tien',
  Cancelled: 'Da huy',
  Rejected: 'Tu choi',
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
      setError('Khong the tai danh sach booking. Vui long thu lai.');
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
    <main className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Don dat xe cua toi</h1>
            <p className="text-gray-600">Quan ly tat ca cac don dat xe cua ban</p>
          </div>
          <button id="refreshBtn" onClick={() => void loadBookings()} className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all">
            <i className="fas fa-sync-alt mr-2" /> Lam moi
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-red-500 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`filter-tab px-6 py-3 font-medium whitespace-nowrap ${activeTab === tab.key ? 'text-green-500 border-b-2 border-green-500' : 'text-gray-600 hover:text-green-500'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} (<span>{countByTab(tab.statuses)}</span>)
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="bg-white rounded-lg shadow-md p-12 text-center">Dang tai...</div> : null}

        {!loading && filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chua co don dat xe nao</h3>
            <p className="text-gray-500 mb-6">Hay bat dau thue xe de trai nghiem dich vu cua chung toi!</p>
            <Link to="/vehicles" className="inline-block bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all">
              <i className="fas fa-car mr-2" /> Thue xe ngay
            </Link>
          </div>
        ) : null}

        {!loading && filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.bookingId} className="booking-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.bookingCode}</h3>
                        <span className={`status-badge px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusText[booking.status] || booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        <i className="fas fa-map-marker-alt mr-1" /> {booking.pickupLocation || 'N/A'}
                      </p>
                    </div>

                    <div className="mt-3 md:mt-0 text-right">
                      <p className="text-sm text-gray-600">Tong tien</p>
                      <p className="text-2xl font-bold text-green-500">{new Intl.NumberFormat('vi-VN').format(booking.totalAmount)} ₫</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Nhan xe</p>
                      <p className="font-semibold text-gray-800">
                        <i className="fas fa-calendar-check text-green-500 mr-2" />
                        {new Date(booking.pickupDateTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tra xe</p>
                      <p className="font-semibold text-gray-800">
                        <i className="fas fa-calendar-times text-red-500 mr-2" />
                        {new Date(booking.returnDateTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link to={`/booking/confirmation/${booking.bookingId}`} className="btn-detail px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium">
                      <i className="fas fa-eye mr-1" /> Xem chi tiet
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

export default MyBookingsPage;
