import { useEffect, useMemo, useState } from 'react';
import {
  approveOwnerBooking,
  completeOwnerBooking,
  getOwnerBookings,
  handoverOwnerBooking,
  rejectOwnerBooking,
} from '../../../api/ownerApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { useNotification } from '../../../hooks/useNotification';
import type { OwnerBooking } from '../../../types/owner';

const bookingTabs = [
  { key: 'all', label: 'Tat ca', statuses: [] as string[] },
  { key: 'pending', label: 'Pending', statuses: ['Pending'] },
  { key: 'awaiting', label: 'Awaiting Deposit', statuses: ['AwaitingDeposit', 'Approved'] },
  { key: 'confirmed', label: 'Confirmed', statuses: ['Confirmed'] },
  { key: 'ongoing', label: 'Ongoing', statuses: ['Ongoing'] },
  { key: 'completed', label: 'Completed', statuses: ['Completed'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['Cancelled', 'Rejected', 'RefundPending', 'Refunded'] },
];

const OwnerBookingPage = () => {
  const { success, warning, error: notifyError } = useNotification();
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOwnerBookings();
      setBookings(data);
    } catch {
      setError('Khong the tai danh sach booking owner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const currentTab = bookingTabs.find((tab) => tab.key === activeTab);
    if (!currentTab || currentTab.statuses.length === 0) {
      return bookings;
    }
    return bookings.filter((booking) => currentTab.statuses.includes(booking.status));
  }, [activeTab, bookings]);

  const onUpdateBooking = (updatedBooking: OwnerBooking) => {
    setBookings((prev) => prev.map((item) => (item.bookingId === updatedBooking.bookingId ? updatedBooking : item)));
  };

  const onApprove = async (booking: OwnerBooking) => {
    setProcessingId(booking.bookingId);
    try {
      const updated = await approveOwnerBooking(booking.bookingId);
      onUpdateBooking(updated);
      success('Da duyet booking thanh cong.');
    } catch {
      notifyError('Khong the duyet booking nay.');
    } finally {
      setProcessingId(null);
    }
  };

  const onReject = async (booking: OwnerBooking) => {
    const reason = window.prompt('Nhap ly do tu choi booking:');
    if (!reason) {
      warning('Ban can nhap ly do de tu choi booking.');
      return;
    }

    setProcessingId(booking.bookingId);
    try {
      const updated = await rejectOwnerBooking(booking.bookingId, { reason });
      onUpdateBooking(updated);
      success('Da tu choi booking.');
    } catch {
      notifyError('Khong the tu choi booking nay.');
    } finally {
      setProcessingId(null);
    }
  };

  const onHandover = async (booking: OwnerBooking) => {
    const odometerRaw = window.prompt('Nhap odometer khi giao xe:', '0');
    if (!odometerRaw) {
      warning('Can nhap odometer de giao xe.');
      return;
    }
    const odometer = Number(odometerRaw);
    if (!Number.isFinite(odometer) || odometer < 0) {
      warning('Odometer khong hop le.');
      return;
    }

    const notes = window.prompt('Ghi chu giao xe (tu chon):') ?? '';

    setProcessingId(booking.bookingId);
    try {
      const updated = await handoverOwnerBooking(booking.bookingId, {
        odometer,
        notes,
      });
      onUpdateBooking(updated);
      success('Da giao xe, booking chuyen sang Ongoing.');
    } catch {
      notifyError('Khong the giao xe cho booking nay.');
    } finally {
      setProcessingId(null);
    }
  };

  const onComplete = async (booking: OwnerBooking) => {
    const notes = window.prompt('Ghi chu hoan tat chuyen di (tu chon):') ?? '';
    const setMaintenance = window.confirm('Dat trang thai xe sang Maintenance sau khi hoan tat?');

    setProcessingId(booking.bookingId);
    try {
      const updated = await completeOwnerBooking(booking.bookingId, {
        notes,
        setMaintenance,
      });
      onUpdateBooking(updated);
      success('Da hoan tat chuyen di.');
    } catch {
      notifyError('Khong the hoan tat booking nay.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingState message="Dang tai booking owner..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadBookings()} />;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
          <p className="text-sm text-slate-600">Theo doi booking va xu ly cac buoc duyet, giao xe, hoan tat.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadBookings()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <div className="flex flex-wrap gap-2">
          {bookingTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                tab.key === activeTab ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState message="Khong co booking nao trong nhom da chon." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Khach</th>
                <th className="px-4 py-3 font-semibold">Xe</th>
                <th className="px-4 py-3 font-semibold">Thoi gian</th>
                <th className="px-4 py-3 font-semibold">Tong tien</th>
                <th className="px-4 py-3 font-semibold">Trang thai</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td className="px-4 py-3 text-slate-800">{booking.bookingCode}</td>
                  <td className="px-4 py-3 text-slate-700">{booking.userFullName || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{booking.vehicleModel || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{booking.licensePlate || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{new Date(booking.pickupDateTime).toLocaleString('vi-VN')}</div>
                    <div className="text-xs text-slate-500">{new Date(booking.returnDateTime).toLocaleString('vi-VN')}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{new Intl.NumberFormat('vi-VN').format(booking.totalAmount)} đ</div>
                    <div className="text-xs text-slate-500">Con lai: {new Intl.NumberFormat('vi-VN').format(booking.remainingAmount)} đ</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{booking.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {booking.status === 'Pending' ? (
                        <>
                          <button
                            type="button"
                            disabled={processingId === booking.bookingId}
                            onClick={() => void onApprove(booking)}
                            className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={processingId === booking.bookingId}
                            onClick={() => void onReject(booking)}
                            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}

                      {booking.status === 'Confirmed' ? (
                        <button
                          type="button"
                          disabled={processingId === booking.bookingId}
                          onClick={() => void onHandover(booking)}
                          className="rounded-md border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                        >
                          Handover
                        </button>
                      ) : null}

                      {booking.status === 'Ongoing' ? (
                        <button
                          type="button"
                          disabled={processingId === booking.bookingId}
                          onClick={() => void onComplete(booking)}
                          className="rounded-md border border-violet-300 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60"
                        >
                          Complete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OwnerBookingPage;
