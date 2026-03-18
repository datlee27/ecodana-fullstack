import { useEffect, useState } from 'react';
import { getOwnerPayments } from '../../../api/ownerApi';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import type { OwnerPaymentsData } from '../../../types/owner';

const OwnerPaymentPage = () => {
  const [data, setData] = useState<OwnerPaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await getOwnerPayments();
      setData(payload);
    } catch {
      setError('Khong the tai du lieu thanh toan owner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  if (loading) {
    return <LoadingState message="Dang tai payment owner..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => void loadPayments()} />;
  }

  const items = data?.items ?? [];
  const stats = data?.stats ?? { totalRevenue: 0, netRevenue: 0 };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment Management</h1>
        <p className="text-sm text-slate-600">Theo doi lich su nhan tien va doanh thu thuc nhan.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)} đ</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Net Revenue</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{new Intl.NumberFormat('vi-VN').format(stats.netRevenue)} đ</p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Chua co giao dich thanh toan nao." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Booking</th>
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.paymentId}>
                  <td className="px-4 py-3 text-slate-800">{item.bookingCode || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-700">{item.vehicleModel || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-700">{item.paymentType || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-700">{new Intl.NumberFormat('vi-VN').format(item.amount)} đ</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{item.paymentStatus || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.paymentDate ? new Date(item.paymentDate).toLocaleString('vi-VN') : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default OwnerPaymentPage;
