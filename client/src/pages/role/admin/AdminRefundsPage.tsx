// ─── AdminRefundsPage — with Approve / Reject / Mark-Transferred actions ──────
import { useCallback, useState } from 'react';
import { useAdminRefunds, useRefundStats, useRefundMutations } from '../../../hooks/admin';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';
import AdminPageWrapper from '../../../components/common/AdminPageWrapper';
import { ActionMenu, NotesDialog, ConfirmDialog } from '../../../components/common/AdminActionMenu';
import type { RefundRequest, RefundStatus } from '../../../types/admin';

const REFUND_STATUSES: { label: string; value: RefundStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'Pending' },
  { label: 'Đã từ chối', value: 'Rejected' },
  { label: 'Hoàn tất', value: 'Refunded' },
];
const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '-';
const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const STATUS_BADGE: Record<RefundStatus, string> = {
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Rejected: 'bg-error/10 text-error border-error/20',
  Refunded: 'bg-success/10 text-success border-success/20',
};
const STATUS_LABELS: Record<RefundStatus, string> = { Pending: 'Chờ xử lý', Rejected: 'Đã từ chối', Refunded: 'Hoàn tất' };

type DialogType = 'approve' | 'reject' | 'transfer';
interface ActiveDialog { type: DialogType; refund: RefundRequest; }

const SkeletonRow = () => (
  <tr className="hover:bg-canvas transition-colors">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-5 py-4"><div className="h-4 w-full bg-muted-surface rounded animate-pulse" /></td>
    ))}
  </tr>
);

const AdminRefundsPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RefundStatus | undefined>(undefined);
  const { data: refunds, loading, error, refetch } = useAdminRefunds({ status, search });
  const { data: stats, loading: statsLoading } = useRefundStats();
  const { approve, reject, markTransferred, loading: mutLoading } = useRefundMutations();
  const safeRefunds = refunds ?? [];
  const { pageData, pagination, goToPage, setPageSize, visiblePages } = usePagination(safeRefunds);

  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleApprove = useCallback(async (notes: string) => {
    if (!activeDialog) return;
    try { await approve(activeDialog.refund.refundRequestId, notes); refetch(); setActiveDialog(null); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi không xác định'); }
  }, [activeDialog, approve, refetch]);

  const handleReject = useCallback(async (notes: string) => {
    if (!activeDialog) return;
    try { await reject(activeDialog.refund.refundRequestId, notes); refetch(); setActiveDialog(null); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi không xác định'); }
  }, [activeDialog, reject, refetch]);

  const handleTransfer = useCallback(async () => {
    if (!activeDialog) return;
    try { await markTransferred(activeDialog.refund.refundRequestId); refetch(); setActiveDialog(null); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi không xác định'); }
  }, [activeDialog, markTransferred, refetch]);

  const kpiData = statsLoading || !stats
    ? [{ label: 'Chờ xử lý', value: '-', dot: 'bg-warning' }, { label: 'Đã hoàn tiền', value: '-', dot: 'bg-success' }, { label: 'Đã từ chối', value: '-', dot: 'bg-error' }]
    : [{ label: 'Chờ xử lý', value: String(stats.pending ?? 0), dot: 'bg-warning' }, { label: 'Đã hoàn tiền', value: String(stats.refunded ?? 0), dot: 'bg-success' }, { label: 'Đã từ chối', value: String(stats.rejected ?? 0), dot: 'bg-error' }];

  return (
    <>
      {activeDialog?.type === 'approve' && (
        <NotesDialog title="Phê duyệt yêu cầu hoàn tiền" placeholder="Ghi chú cho khách hàng (tuỳ chọn)..." confirmLabel="Phê duyệt" confirmVariant="success" onConfirm={handleApprove} onCancel={() => setActiveDialog(null)} busy={mutLoading} />
      )}
      {activeDialog?.type === 'reject' && (
        <NotesDialog title="Từ chối yêu cầu hoàn tiền" placeholder="Lý do từ chối (bắt buộc)..." confirmLabel="Từ chối" confirmVariant="danger" onConfirm={handleReject} onCancel={() => setActiveDialog(null)} busy={mutLoading} />
      )}
      {activeDialog?.type === 'transfer' && (
        <ConfirmDialog
          title="Xác nhận đã chuyển khoản"
          message={`Xác nhận đã chuyển khoản hoàn tiền cho đơn "${activeDialog.refund.bookingCode || activeDialog.refund.refundRequestId.slice(0, 8)}"?`}
          confirmLabel="Đã chuyển khoản"
          confirmVariant="success"
          onConfirm={handleTransfer}
          onCancel={() => setActiveDialog(null)}
          busy={mutLoading}
        />
      )}

      <AdminPageWrapper
        title="Quản lý hoàn tiền"
        description="Theo dõi yêu cầu hoàn tiền và tiến độ xử lý."
        topControls={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {kpiData.map(({ label, value, dot }) => (
              <div key={label} className="bg-surface border border-border-color rounded-xl p-5 flex flex-col">
                <span className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${dot}`} />{label}</span>
                <span className="text-2xl font-bold text-text-strong">{statsLoading ? <span className="inline-block h-8 w-24 bg-muted-surface rounded animate-pulse" /> : value}</span>
              </div>
            ))}
          </div>
        }
        bottomControls={<Pagination pagination={pagination} visiblePages={visiblePages} onPageChange={goToPage} onPageSizeChange={setPageSize} />}
      >
        <div className="h-full flex flex-col bg-surface border border-border-color rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">search</span>
              <input type="search" placeholder="Tìm kiếm mã hoàn tiền..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-surface border border-border-color rounded-lg text-sm focus:border-eco-green focus:ring-1 focus:ring-eco-green outline-none text-text-strong" />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {REFUND_STATUSES.map((s) => (
                <button key={s.value} type="button" onClick={() => setStatus(s.value === 'all' ? undefined : s.value)}
                  className={`px-4 h-9 rounded-lg text-sm font-medium whitespace-nowrap ${(s.value === 'all' && !status) || s.value === status ? 'bg-muted-surface text-text-strong' : 'bg-surface border border-border-color text-text-base hover:bg-canvas'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {(error || actionError) && <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4 m-4"><p>Lỗi: {error || actionError}</p></div>}

          <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-auto scrollbar-elegant">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-muted-surface text-text-muted font-medium sticky top-0 z-10">
                <tr>
                  <th className="w-[13%] px-5 py-3 font-medium">Mã hoàn tiền</th>
                  <th className="w-[16%] px-5 py-3 font-medium">Khách hàng</th>
                  <th className="w-[23%] px-5 py-3 font-medium">Lý do</th>
                  <th className="w-[12%] px-5 py-3 font-medium">Ngày yêu cầu</th>
                  <th className="w-[13%] px-5 py-3 font-medium text-right">Số tiền</th>
                  <th className="w-[12%] px-5 py-3 font-medium">Trạng thái</th>
                  <th className="w-24 px-5 py-3 font-medium text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? <tr><td colSpan={7} className="px-5 py-8 text-center text-text-muted">Không có yêu cầu hoàn tiền nào</td></tr>
                    : pageData.map((r) => (
                      <tr key={r.refundRequestId} className="hover:bg-canvas transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-text-strong font-medium truncate">{r.refundRequestId.slice(0, 8)}</span>
                            <span className="text-text-muted text-xs truncate">{r.bookingCode || '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className="text-text-strong truncate block">{r.customerName || 'N/A'}</span></td>
                        <td className="px-5 py-4"><span className="text-text-base truncate block">{r.cancelReason}</span></td>
                        <td className="px-5 py-4 text-text-muted">{formatDate(r.createdDate)}</td>
                        <td className="px-5 py-4 text-right font-medium">{formatVND(r.refundAmount)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ActionMenu items={[
                            ...(r.status === 'Pending' ? [
                              { label: 'Phê duyệt', icon: 'check_circle', variant: 'success' as const, onClick: () => setActiveDialog({ type: 'approve', refund: r }) },
                              { label: 'Từ chối', icon: 'cancel', variant: 'danger' as const, onClick: () => setActiveDialog({ type: 'reject', refund: r }) },
                              { label: 'Đã chuyển khoản', icon: 'payments', variant: 'warning' as const, onClick: () => setActiveDialog({ type: 'transfer', refund: r }) },
                              { label: '---', icon: '', onClick: () => {} },
                            ] : []),
                            { label: 'Xem chi tiết', icon: 'visibility', onClick: () => {} },
                          ]} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminPageWrapper>
    </>
  );
};

export default AdminRefundsPage;
