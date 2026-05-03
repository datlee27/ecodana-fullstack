import { useEffect, useState } from 'react';
import { getOwnerPayments } from '../../../api/ownerApi';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { Badge, DataTable, EmptyState, PageHeader } from '../../../design-system';
import type { DataTableColumn } from '../../../design-system';
import type { OwnerPaymentsData } from '../../../types/owner';

const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} d`;

const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString('vi-VN') : 'Chua cap nhat');

const getPaymentStatusTone = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PAID':
      return 'success' as const;
    case 'PENDING':
    case 'PROCESSING':
      return 'warning' as const;
    case 'FAILED':
    case 'CANCELLED':
      return 'danger' as const;
    default:
      return 'neutral' as const;
  }
};

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
  const columns: Array<DataTableColumn<(typeof items)[number]>> = [
    {
      key: 'booking',
      header: 'Booking',
      render: (item) => (
        <div className="space-y-1">
          <div className="font-semibold text-text-strong">{item.bookingCode || 'Chua cap nhat'}</div>
          {item.orderCode ? <div className="text-xs text-text-muted">Order: {item.orderCode}</div> : null}
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Xe',
      render: (item) => (
        <div className="space-y-1">
          <div>{item.vehicleModel || 'Chua cap nhat'}</div>
          {item.licensePlate ? <div className="text-xs text-text-muted">{item.licensePlate}</div> : null}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loai thanh toan',
      render: (item) => item.paymentType || 'Chua cap nhat',
    },
    {
      key: 'amount',
      header: 'So tien',
      align: 'right',
      render: (item) => <span className="font-semibold text-text-strong">{formatCurrency(item.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Trang thai',
      render: (item) => (
        <Badge tone={getPaymentStatusTone(item.paymentStatus)} size="md">
          {item.paymentStatus || 'Khong ro'}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Thoi diem',
      render: (item) => formatDateTime(item.paymentDate || item.createdDate),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Owner portal"
        title="Quan ly thanh toan"
        description="Theo doi doanh thu, tien thuc nhan va lich su giao dich cua cac booking da xu ly."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm text-text-muted">Tong doanh thu</p>
          <p className="mt-1 text-2xl font-bold text-text-strong">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm text-text-muted">Doanh thu thuc nhan</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrency(stats.netRevenue)}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Chua co giao dich thanh toan" description="Khi booking phat sinh doanh thu, lich su giao dich se hien thi tai day." />
      ) : (
        <DataTable columns={columns} rows={items} getRowKey={(item) => item.paymentId} />
      )}
    </section>
  );
};

export default OwnerPaymentPage;
