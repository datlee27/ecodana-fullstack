// ─── AdminBookingsPage — with Status Update actions ───────────────────────────
import { useCallback, useState } from 'react';
import { useAdminBookings, useAdminBookingStats, useDebounce } from '../../../hooks/useAdminData';
import { usePagination } from '../../../hooks/usePagination';
import { updateAdminBookingStatus } from '../../../api/adminApi';
import Pagination from '../../../components/common/Pagination';
import AdminPageWrapper from '../../../components/common/AdminPageWrapper';
import { ActionMenu, ConfirmDialog } from '../../../components/common/AdminActionMenu';
import type { AdminBooking } from '../../../types/admin';

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Đang chờ', Confirmed: 'Đã xác nhận', Active: 'Đang thuê',
  Completed: 'Hoàn thành', Cancelled: 'Đã hủy', Rejected: 'Từ chối',
};
const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-orange-100 text-orange-600', Confirmed: 'bg-mobility-blue-soft text-mobility-blue',
  Active: 'bg-eco-green-soft text-eco-green', Completed: 'bg-gray-100 text-text-muted',
  Cancelled: 'bg-red-100 text-red-600', Rejected: 'bg-red-100 text-red-600',
};
const NEXT_STATUSES: Record<string, { label: string; status: string; variant: 'success' | 'danger' | 'warning' }[]> = {
  Pending: [
    { label: 'Xác nhận', status: 'Confirmed', variant: 'success' },
    { label: 'Từ chối', status: 'Rejected', variant: 'danger' },
  ],
  Confirmed: [
    { label: 'Bắt đầu thuê', status: 'Active', variant: 'success' },
    { label: 'Huỷ đơn', status: 'Cancelled', variant: 'danger' },
  ],
  Active: [{ label: 'Hoàn thành', status: 'Completed', variant: 'success' }],
};
const fmt = (v: number | null | undefined) => v != null ? v.toLocaleString('vi-VN') + ' ₫' : '—';
const fmtDate = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString('vi-VN') : '—';
const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="h-4 w-24 bg-muted-surface rounded animate-pulse mb-1" /><div className="h-3 w-16 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 w-28 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 w-36 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 w-24 bg-muted-surface rounded animate-pulse ml-auto" /></td>
    <td className="px-5 py-4"><div className="h-6 w-24 rounded-full bg-muted-surface animate-pulse" /></td>
    <td className="px-5 py-4 text-right"><div className="w-8 h-8 rounded bg-muted-surface animate-pulse ml-auto" /></td>
  </tr>
);
const FILTER_CHIPS = ['', 'Pending', 'Active', 'Completed', 'Cancelled'];
const CHIP_LABELS: Record<string, string> = { '': 'Tất cả', Pending: 'Đang chờ', Active: 'Đang thuê', Completed: 'Hoàn thành', Cancelled: 'Đã hủy' };
interface PendingAction { booking: AdminBooking; next: { label: string; status: string; variant: 'success' | 'danger' | 'warning' }; }

const AdminBookingsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, loading, error, refetch } = useAdminBookings(statusFilter, debouncedSearch);
  const bookings: AdminBooking[] = Array.isArray(data) ? data : [];
  const { data: stats, loading: statsLoading } = useAdminBookingStats();
  const { pageData, pagination, goToPage, setPageSize, visiblePages } = usePagination(bookings);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusChange = useCallback(async () => {
    if (!pendingAction) return;
    setBusy(true); setActionError(null);
    try { await updateAdminBookingStatus(pendingAction.booking.bookingId, pendingAction.next.status); refetch(); setPendingAction(null); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi không xác định'); }
    finally { setBusy(false); }
  }, [pendingAction, refetch]);

  const kpiCards = [
    { label: 'Tổng đơn', dot: 'bg-eco-green', value: stats?.total },
    { label: 'Đang chờ', dot: 'bg-warning', value: stats?.pending },
    { label: 'Đang thuê', dot: 'bg-mobility-blue', value: stats?.active },
    { label: 'Doanh thu', dot: 'bg-success', value: stats?.totalRevenue != null ? stats.totalRevenue.toLocaleString('vi-VN') + ' ₫' : undefined },
  ];

  return (
    <>
      {pendingAction && (
        <ConfirmDialog
          title={`${pendingAction.next.label} đơn đặt xe`}
          message={`Xác nhận chuyển đơn "${pendingAction.booking.bookingCode}" sang "${STATUS_LABELS[pendingAction.next.status] ?? pendingAction.next.status}"?`}
          confirmLabel={pendingAction.next.label}
          confirmVariant={pendingAction.next.variant}
          onConfirm={handleStatusChange}
          onCancel={() => setPendingAction(null)}
          busy={busy}
        />
      )}
      <AdminPageWrapper
        title="Quản lý đơn đặt xe"
        description="Theo dõi và quản lý toàn bộ giao dịch đặt xe trên hệ thống."
        topControls={
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpiCards.map(({ label, dot, value }) => (
                <div key={label} className="bg-surface border border-border-color rounded-xl p-5 flex flex-col">
                  <span className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${dot}`} />{label}</span>
                  {statsLoading ? <div className="h-8 w-24 bg-muted-surface rounded animate-pulse" /> : <p className="text-2xl font-bold text-text-strong">{value ?? '—'}</p>}
                </div>
              ))}
            </div>
            {(error || actionError) && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error || actionError}</div>}
          </>
        }
        bottomControls={<Pagination pagination={pagination} visiblePages={visiblePages} onPageChange={goToPage} onPageSizeChange={setPageSize} />}
      >
        <div className="h-full flex flex-col bg-surface border border-border-color rounded-xl overflow-hidden">
          <div className="flex-none p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">search</span>
              <input type="search" placeholder="Tìm kiếm mã đặt xe..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-surface border border-border-color rounded-lg text-sm focus:border-eco-green focus:ring-1 focus:ring-eco-green outline-none text-text-strong" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {FILTER_CHIPS.map((s) => (
                <button key={s} type="button" onClick={() => setStatusFilter(s)}
                  className={`px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-eco-green text-white' : 'bg-surface border border-border-color text-text-base hover:bg-canvas'}`}>
                  {CHIP_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-auto scrollbar-elegant">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-muted-surface text-text-muted font-medium sticky top-0 z-10">
                <tr>
                  <th className="w-[28%] px-5 py-3 font-medium">Mã đặt xe / Khách</th>
                  <th className="w-[20%] px-5 py-3 font-medium">Phương tiện</th>
                  <th className="w-[20%] px-5 py-3 font-medium">Thời gian thuê</th>
                  <th className="w-[13%] px-5 py-3 font-medium text-right">Tổng tiền</th>
                  <th className="w-[13%] px-5 py-3 font-medium">Trạng thái</th>
                  <th className="w-24 px-5 py-3 font-medium text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? <tr><td colSpan={6} className="py-16 text-center text-sm text-text-muted"><span className="material-symbols-outlined text-[40px] mb-2 block text-border-color">receipt_long</span>Không có đơn đặt xe phù hợp</td></tr>
                    : pageData.map((b) => {
                        const transitions = NEXT_STATUSES[b.status ?? ''] ?? [];
                        return (
                          <tr key={b.bookingId} className="hover:bg-canvas transition-colors">
                            <td className="px-5 py-4"><p className="font-mono text-xs font-medium text-text-strong truncate">{b.bookingCode}</p><p className="text-xs text-text-muted mt-0.5 truncate">{b.userName ?? b.userEmail ?? '—'}</p></td>
                            <td className="px-5 py-4 text-sm text-text-base truncate">{b.vehicleModel ?? '—'}</td>
                            <td className="px-5 py-4 text-sm text-text-muted">{fmtDate(b.pickupDateTime)} → {fmtDate(b.returnDateTime)}</td>
                            <td className="px-5 py-4 text-sm text-right font-medium text-text-strong">{fmt(b.totalAmount)}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[b.status ?? ''] ?? 'bg-gray-100 text-text-muted'}`}>
                                {STATUS_LABELS[b.status ?? ''] ?? b.status ?? '—'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <ActionMenu items={[
                                ...transitions.map((t) => ({ label: t.label, icon: t.variant === 'success' ? 'check_circle' : 'cancel', variant: t.variant, onClick: () => setPendingAction({ booking: b, next: t }) })),
                                ...(transitions.length > 0 ? [{ label: '---', icon: '', onClick: () => {} }] : []),
                                { label: 'Xem chi tiết', icon: 'visibility', onClick: () => {} },
                              ]} />
                            </td>
                          </tr>
                        );
                      })}
              </tbody>
            </table>
          </div>
        </div>
      </AdminPageWrapper>
    </>
  );
};

export default AdminBookingsPage;
