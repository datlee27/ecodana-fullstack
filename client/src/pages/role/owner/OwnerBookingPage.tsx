import { useEffect, useMemo, useState } from 'react';
import {
  approveOwnerBooking,
  completeOwnerBooking,
  getOwnerBookings,
  handoverOwnerBooking,
  rejectOwnerBooking,
} from '../../../api/ownerApi';
import { ErrorState } from '../../../components/common/ErrorState';
import { LoadingState } from '../../../components/common/LoadingState';
import { Badge, Button, ConfirmDialog, DataTable, EmptyState, Input, PageHeader } from '../../../design-system';
import type { DataTableColumn } from '../../../design-system/components/DataTable';
import { useNotification } from '../../../hooks/useNotification';
import type { OwnerBooking } from '../../../types/owner';

const bookingTabs = [
  { key: 'all', label: 'Tat ca', statuses: [] as string[] },
  { key: 'pending', label: 'Cho duyet', statuses: ['Pending'] },
  { key: 'awaiting', label: 'Cho coc', statuses: ['AwaitingDeposit', 'Approved'] },
  { key: 'confirmed', label: 'Da xac nhan', statuses: ['Confirmed'] },
  { key: 'ongoing', label: 'Dang thue', statuses: ['Ongoing'] },
  { key: 'completed', label: 'Hoan tat', statuses: ['Completed'] },
  { key: 'cancelled', label: 'Da huy', statuses: ['Cancelled', 'Rejected', 'RefundPending', 'Refunded'] },
];

const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)} d`;
const formatDateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

const getBookingStatusTone = (status?: string) => {
  switch (status) {
    case 'Completed':
    case 'Refunded':
      return 'success' as const;
    case 'Pending':
    case 'AwaitingDeposit':
    case 'RefundPending':
      return 'warning' as const;
    case 'Rejected':
    case 'Cancelled':
      return 'danger' as const;
    case 'Approved':
    case 'Confirmed':
    case 'Ongoing':
      return 'info' as const;
    default:
      return 'neutral' as const;
  }
};

const OwnerBookingPage = () => {
  const { success, warning, error: notifyError } = useNotification();
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<OwnerBooking | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [handoverTarget, setHandoverTarget] = useState<OwnerBooking | null>(null);
  const [handoverOdometer, setHandoverOdometer] = useState('0');
  const [handoverNotes, setHandoverNotes] = useState('');

  const [completeTarget, setCompleteTarget] = useState<OwnerBooking | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');

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

  const onSubmitReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      warning('Ban can nhap ly do de tu choi booking.');
      return;
    }

    setProcessingId(rejectTarget.bookingId);
    try {
      const updated = await rejectOwnerBooking(rejectTarget.bookingId, { reason });
      onUpdateBooking(updated);
      success('Da tu choi booking.');
      setRejectTarget(null);
      setRejectReason('');
    } catch {
      notifyError('Khong the tu choi booking nay.');
    } finally {
      setProcessingId(null);
    }
  };

  const onSubmitHandover = async () => {
    if (!handoverTarget) return;

    const odometer = Number(handoverOdometer);
    if (!Number.isFinite(odometer) || odometer < 0) {
      warning('Odometer khong hop le.');
      return;
    }

    setProcessingId(handoverTarget.bookingId);
    try {
      const updated = await handoverOwnerBooking(handoverTarget.bookingId, {
        odometer,
        notes: handoverNotes.trim(),
      });
      onUpdateBooking(updated);
      success('Da giao xe, booking chuyen sang Ongoing.');
      setHandoverTarget(null);
      setHandoverOdometer('0');
      setHandoverNotes('');
    } catch {
      notifyError('Khong the giao xe cho booking nay.');
    } finally {
      setProcessingId(null);
    }
  };

  const onSubmitComplete = async () => {
    if (!completeTarget) return;

    setProcessingId(completeTarget.bookingId);
    try {
      const updated = await completeOwnerBooking(completeTarget.bookingId, {
        notes: completeNotes.trim(),
        setMaintenance: true,
      });
      onUpdateBooking(updated);
      success('Da hoan tat chuyen di. Xe da chuyen sang Maintenance.');
      setCompleteTarget(null);
      setCompleteNotes('');
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
      render: (booking) => (
        <div className="space-y-1">
          <div className="font-medium text-text-strong">{booking.vehicleModel || 'Chua cap nhat'}</div>
          {booking.licensePlate ? <div className="text-xs text-text-muted">{booking.licensePlate}</div> : null}
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Thoi gian',
      render: (booking) => (
        <div className="space-y-1 text-sm">
          <div>{formatDateTime(booking.pickupDateTime)}</div>
          <div className="text-text-muted">{formatDateTime(booking.returnDateTime)}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Tong tien',
      align: 'right',
      render: (booking) => (
        <div className="space-y-1">
          <div className="font-semibold text-text-strong">{formatCurrency(booking.totalAmount)}</div>
          <div className="text-xs text-text-muted">Con lai: {formatCurrency(booking.remainingAmount)}</div>
        </div>
      ),
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
    {
      key: 'actions',
      header: 'Thao tac',
      align: 'right',
      headerClassName: 'w-[17rem]',
      render: (booking) => (
        <div className="flex justify-end gap-2">
          {booking.status === 'Pending' ? (
            <>
              <Button type="button" size="sm" variant="outline" disabled={processingId === booking.bookingId} onClick={() => void onApprove(booking)}>
                Duyet
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={processingId === booking.bookingId}
                onClick={() => {
                  setRejectTarget(booking);
                  setRejectReason('');
                }}
              >
                Tu choi
              </Button>
            </>
          ) : null}

          {booking.status === 'Confirmed' ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={processingId === booking.bookingId}
              onClick={() => {
                setHandoverTarget(booking);
                setHandoverOdometer('0');
                setHandoverNotes('');
              }}
            >
              Giao xe
            </Button>
          ) : null}

          {booking.status === 'Ongoing' ? (
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={processingId === booking.bookingId}
              onClick={() => {
                setCompleteTarget(booking);
                setCompleteNotes('');
              }}
            >
              Hoan tat
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <section className="space-y-4">
        <PageHeader
          eyebrow="Owner portal"
          title="Quan ly booking"
          description="Theo doi booking theo tung trang thai va xu ly cac moc duyet, giao xe, hoan tat."
          actions={
            <Button type="button" variant="outline" onClick={() => void loadBookings()}>
              Tai lai
            </Button>
          }
        />

        <div className="rounded-xl border border-border bg-surface p-2">
          <div className="flex flex-wrap gap-2">
            {bookingTabs.map((tab) => (
              <Button
                key={tab.key}
                type="button"
                size="sm"
                variant={tab.key === activeTab ? 'primary' : 'ghost'}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <EmptyState title="Khong co booking nao trong nhom nay" description="Thu chuyen sang tab khac hoac tai lai du lieu de kiem tra cap nhat moi." />
        ) : (
          <DataTable columns={columns} rows={filteredBookings} getRowKey={(booking) => booking.bookingId} />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(rejectTarget)}
        title="Tu choi booking"
        description={rejectTarget ? `Nhap ly do tu choi cho booking ${rejectTarget.bookingCode}.` : undefined}
        confirmLabel="Xac nhan tu choi"
        cancelLabel="Huy"
        tone="danger"
        busy={rejectTarget ? processingId === rejectTarget.bookingId : false}
        onCancel={() => setRejectTarget(null)}
        onConfirm={() => void onSubmitReject()}
      >
        <label htmlFor="reject-reason" className="mb-1.5 block text-sm font-medium text-text-strong">
          Ly do tu choi
        </label>
        <textarea
          id="reject-reason"
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          rows={4}
          placeholder="Nhap ly do tu choi..."
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-strong shadow-sm transition-colors placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(handoverTarget)}
        title="Giao xe"
        description={handoverTarget ? `Cap nhat thong tin giao xe cho booking ${handoverTarget.bookingCode}.` : undefined}
        confirmLabel="Xac nhan giao xe"
        cancelLabel="Huy"
        tone="primary"
        busy={handoverTarget ? processingId === handoverTarget.bookingId : false}
        size="lg"
        onCancel={() => setHandoverTarget(null)}
        onConfirm={() => void onSubmitHandover()}
      >
        <div className="space-y-4">
          <Input
            label="Odometer *"
            type="number"
            min={0}
            value={handoverOdometer}
            onChange={(event) => setHandoverOdometer(event.target.value)}
          />
          <div>
            <label htmlFor="handover-notes" className="mb-1.5 block text-sm font-medium text-text-strong">
              Ghi chu (tuy chon)
            </label>
            <textarea
              id="handover-notes"
              value={handoverNotes}
              onChange={(event) => setHandoverNotes(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-strong shadow-sm transition-colors placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(completeTarget)}
        title="Hoan tat chuyen di"
        description={completeTarget ? `Cap nhat thong tin hoan tat cho booking ${completeTarget.bookingCode}.` : undefined}
        confirmLabel="Xac nhan hoan tat"
        cancelLabel="Huy"
        tone="primary"
        busy={completeTarget ? processingId === completeTarget.bookingId : false}
        size="lg"
        onCancel={() => setCompleteTarget(null)}
        onConfirm={() => void onSubmitComplete()}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="complete-notes" className="mb-1.5 block text-sm font-medium text-text-strong">
              Ghi chu (tuy chon)
            </label>
            <textarea
              id="complete-notes"
              value={completeNotes}
              onChange={(event) => setCompleteNotes(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-strong shadow-sm transition-colors placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Sau khi hoan tat, xe se duoc dua ve trang thai Maintenance de chu xe kiem tra va sac pin.
          </div>
        </div>
      </ConfirmDialog>
    </>
  );
};

export default OwnerBookingPage;
