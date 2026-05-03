// ─── AdminPaymentsPage — with action buttons ──────────────────────────────────
import { useCallback, useState } from 'react';
import { useAdminPayments, usePaymentStats } from '../../../hooks/admin';
import { usePagination } from '../../../hooks/usePagination';
import { markPaymentCompleted, markPaymentFailed, processPaymentRefund } from '../../../api/admin/payments';
import Pagination from '../../../components/common/Pagination';
import AdminPageWrapper from '../../../components/common/AdminPageWrapper';
import { ActionMenu, ConfirmDialog } from '../../../components/common/AdminActionMenu';
import type { Payment, PaymentStatus } from '../../../types/admin';

const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '-';

const STATUS_BADGE: Record<PaymentStatus, string> = {
  Pending: 'bg-warning/10 text-warning border-warning/20',
  Completed: 'bg-success/10 text-success border-success/20',
  Failed: 'bg-error/10 text-error border-error/20',
  Refunded: 'bg-mobility-blue/10 text-mobility-blue border-mobility-blue/20',
};
const STATUS_LABELS: Record<PaymentStatus, string> = {
  Pending: 'Chờ xử lý', Completed: 'Hoàn tất', Failed: 'Thất bại', Refunded: 'Đã hoàn tiền',
};

type ActionType = 'complete' | 'fail' | 'refund';
interface PendingAction { payment: Payment; type: ActionType; }

const ACTION_CONFIG: Record<ActionType, { title: string; message: (p: Payment) => string; label: string; variant: 'success' | 'danger' | 'warning' }> = {
  complete: { title: 'Xác nhận hoàn tất', message: (p) => `Đánh dấu giao dịch "${p.paymentId.slice(0, 8)}" là Hoàn tất?`, label: 'Hoàn tất', variant: 'success' },
  fail:     { title: 'Đánh dấu thất bại', message: (p) => `Đánh dấu giao dịch "${p.paymentId.slice(0, 8)}" là Thất bại?`, label: 'Thất bại', variant: 'danger' },
  refund:   { title: 'Xử lý hoàn tiền',   message: (p) => `Hoàn tiền cho giao dịch "${p.paymentId.slice(0, 8)}"? Trạng thái sẽ chuyển sang Đã hoàn tiền.`, label: 'Hoàn tiền', variant: 'warning' },
};

const SkeletonRow = () => (
  <tr>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-5 py-4"><div className="h-4 w-full bg-muted-surface rounded animate-pulse" /></td>
    ))}
  </tr>
);

const AdminPaymentsPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | undefined>(undefined);
  const { data: payments, loading, error, refetch } = useAdminPayments({ status, search });
  const { data: stats, loading: statsLoading } = usePaymentStats();
  const { pageData, pagination, goToPage, setPageSize, visiblePages } = usePagination(payments ?? []);

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    if (!pendingAction) return;
    setBusy(true); setActionError(null);
    try {
      if (pendingAction.type === 'complete') await markPaymentCompleted(pendingAction.payment.paymentId);
      else if (pendingAction.type === 'fail')   await markPaymentFailed(pendingAction.payment.paymentId);
      else if (pendingAction.type === 'refund') await processPaymentRefund(pendingAction.payment.paymentId);
      refetch(); setPendingAction(null);
    } catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi không xác định'); }
    finally { setBusy(false); }
  }, [pendingAction, refetch]);

  const kpiData = statsLoading || !stats
    ? [{ label: 'Tổng giao dịch', value: '-', dot: 'bg-eco-green' }, { label: 'Chờ xử lý', value: '-', dot: 'bg-warning' }, { label: 'Hoàn tất', value: '-', dot: 'bg-success' }]
    : [{ label: 'Tổng giao dịch', value: String(stats.total ?? 0), dot: 'bg-eco-green' }, { label: 'Chờ xử lý', value: String(stats.pending ?? 0), dot: 'bg-warning' }, { label: 'Hoàn tất', value: String(stats.completed ?? 0), dot: 'bg-success' }];

  return (
    <>
      {pendingAction && (() => { const cfg = ACTION_CONFIG[pendingAction.type]; return (
        <ConfirmDialog
          title={cfg.title}
          message={cfg.message(pendingAction.payment)}
          confirmLabel={cfg.label}
          confirmVariant={cfg.variant}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
          busy={busy}
        />
      ); })()}
      <AdminPageWrapper
        title="Quản lý giao dịch"
        description="Theo dõi dòng tiền, trạng thái thanh toán và đối soát giao dịch."
        topControls={
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {kpiData.map(({ label, value, dot }) => (
                <div key={label} className="bg-surface border border-border-color rounded-xl p-5 flex flex-col">
                  <span className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${dot}`} />{label}</span>
                  <span className="text-2xl font-bold text-text-strong">{statsLoading ? <span className="inline-block h-8 w-24 bg-muted-surface rounded animate-pulse" /> : value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between items-center">
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
                <input type="search" placeholder="Tìm kiếm giao dịch..." value={search} onChange={(e) => setSearch(e.target.value)} className="block w-full h-10 pl-10 pr-3 border border-border-color rounded-lg bg-surface text-sm text-text-strong focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green" />
              </div>
              <select value={status || ''} onChange={(e) => setStatus((e.target.value as PaymentStatus) || undefined)} className="h-10 px-3 border border-border-color rounded-lg text-sm text-text-base bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green appearance-none">
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ xử lý</option><option value="Completed">Hoàn tất</option>
                <option value="Failed">Thất bại</option><option value="Refunded">Đã hoàn tiền</option>
              </select>
            </div>
            {(error || actionError) && <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4 mb-4"><p>Lỗi: {error || actionError}</p></div>}
          </>
        }
        bottomControls={<Pagination pagination={pagination} visiblePages={visiblePages} onPageChange={goToPage} onPageSizeChange={setPageSize} />}
      >
        <div className="h-full flex flex-col bg-surface border border-border-color rounded-xl overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-auto scrollbar-elegant">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-muted-surface text-text-muted font-medium sticky top-0 z-10">
                <tr>
                  <th className="w-[9%] px-5 py-3 font-medium">Mã GD</th>
                  <th className="w-[22%] px-5 py-3 font-medium">Người dùng</th>
                  <th className="w-[13%] px-5 py-3 font-medium">Đơn đặt xe</th>
                  <th className="w-[12%] px-5 py-3 font-medium">Phương thức</th>
                  <th className="w-[14%] px-5 py-3 font-medium text-right">Số tiền</th>
                  <th className="w-[14%] px-5 py-3 font-medium">Trạng thái</th>
                  <th className="w-[11%] px-5 py-3 font-medium text-right">Ngày</th>
                  <th className="w-24 px-5 py-3 font-medium text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? <tr><td colSpan={8} className="px-5 py-8 text-center text-text-muted">Không có giao dịch nào</td></tr>
                    : pageData.map((p) => (
                      <tr key={p.paymentId} className="hover:bg-canvas transition-colors">
                        <td className="px-5 py-4 font-medium text-text-strong truncate">{p.paymentId.slice(0, 8)}</td>
                        <td className="px-5 py-4"><div className="flex flex-col"><span className="text-text-strong truncate">{p.userName || 'N/A'}</span><span className="text-text-muted text-xs truncate">{p.userEmail}</span></div></td>
                        <td className="px-5 py-4 truncate">{p.bookingCode || '-'}</td>
                        <td className="px-5 py-4 truncate">{p.paymentMethod}</td>
                        <td className="px-5 py-4 text-right font-medium">{formatVND(p.amount)}</td>
                        <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[p.paymentStatus]}`}>{STATUS_LABELS[p.paymentStatus]}</span></td>
                        <td className="px-5 py-4 text-right text-text-muted">{formatDate(p.paymentDate)}</td>
                        <td className="px-5 py-4 text-right">
                          <ActionMenu items={[
                            ...(p.paymentStatus === 'Pending' ? [
                              { label: 'Hoàn tất', icon: 'check_circle', variant: 'success' as const, onClick: () => setPendingAction({ payment: p, type: 'complete' }) },
                              { label: 'Thất bại', icon: 'cancel', variant: 'danger' as const, onClick: () => setPendingAction({ payment: p, type: 'fail' }) },
                              { label: '---', icon: '', onClick: () => {} },
                            ] : []),
                            ...(p.paymentStatus === 'Completed' ? [
                              { label: 'Hoàn tiền', icon: 'currency_exchange', variant: 'warning' as const, onClick: () => setPendingAction({ payment: p, type: 'refund' }) },
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

export default AdminPaymentsPage;
