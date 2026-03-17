import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBookingDetail } from '../api/bookingApi';
import type { BookingSummary } from '../types/booking';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getBookingDetail(bookingId);
        setBooking(data);
      } catch {
        setError('Khong the tai chi tiet booking.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [bookingId]);

  return (
    <main className="pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? <div className="bg-white rounded-lg shadow-md p-8 text-center">Dang tai...</div> : null}
        {error ? <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div> : null}

        {!loading && booking ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Chi tiet dat xe</h1>
            <p className="text-gray-600 mb-6">Ma don: {booking.bookingCode}</p>

            <div className="space-y-3 text-sm">
              <p><strong>Trang thai:</strong> {booking.status}</p>
              <p><strong>Xe:</strong> {booking.vehicleModel}</p>
              <p><strong>Nhan xe:</strong> {new Date(booking.pickupDateTime).toLocaleString('vi-VN')}</p>
              <p><strong>Tra xe:</strong> {new Date(booking.returnDateTime).toLocaleString('vi-VN')}</p>
              <p><strong>Dia diem:</strong> {booking.pickupLocation || 'N/A'}</p>
              <p><strong>Tong tien:</strong> {new Intl.NumberFormat('vi-VN').format(booking.totalAmount)} ₫</p>
            </div>

            <div className="mt-8 flex gap-3">
              <Link to="/booking/my-bookings" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Ve danh sach booking
              </Link>
              <Link to="/vehicles" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Kham pha them xe
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default BookingConfirmationPage;
