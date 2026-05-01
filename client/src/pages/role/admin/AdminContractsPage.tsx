// ─── AdminContractsPage — with Detail Drawer + Status Actions ─────────────────
import { useCallback, useState } from 'react';
import { useAdminContracts } from '../../../hooks/admin';
import { usePagination } from '../../../hooks/usePagination';
import axiosClient from '../../../api/axios';
import Pagination from '../../../components/common/Pagination';
import AdminPageWrapper from '../../../components/common/AdminPageWrapper';
import { ActionMenu, ConfirmDialog } from '../../../components/common/AdminActionMenu';
import { DetailDrawer, DetailRow, DetailSection, DetailBadge } from '../../../components/common/DetailDrawer';
import type { Contract, ContractStatus } from '../../../types/admin';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtVND = (v?: number) => v != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '—';

const STATUS_BADGE: Record<ContractStatus, { label: string; cls: string }> = {
  Draft:     { label: 'Bản nháp',  cls: 'bg-warning/10 text-warning border-warning/20' },
  Signed:    { label: 'Đã ký',     cls: 'bg-mobility-blue/10 text-mobility-blue border-mobility-blue/20' },
  Completed: { label: 'Hoàn tất',  cls: 'bg-success/10 text-success border-success/20' },
  Cancelled: { label: 'Đã hủy',   cls: 'bg-error/10 text-error border-error/20' },
};

// Valid status transitions per status
const STATUS_TRANSITIONS: Record<string, { label: string; to: ContractStatus; variant: 'success' | 'danger' | 'warning' }[]> = {
  Draft:  [{ label: 'Đánh dấu đã ký', to: 'Signed',    variant: 'success' }, { label: 'Huỷ hợp đồng', to: 'Cancelled', variant: 'danger' }],
  Signed: [{ label: 'Hoàn tất',        to: 'Completed', variant: 'success' }, { label: 'Huỷ hợp đồng', to: 'Cancelled', variant: 'danger' }],
};

/** Client-side contract status update — calls PATCH /admin/api/contracts/{id}/status */
async function updateContractStatus(id: string, status: ContractStatus): Promise<void> {
  await axiosClient.patch(`/admin/api/contracts/${id}/status`, null, { params: { status } });
}

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="h-4 bg-muted-surface rounded w-24 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 bg-muted-surface rounded w-32 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 bg-muted-surface rounded w-28 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 bg-muted-surface rounded w-20 animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-6 bg-muted-surface rounded-full w-24 animate-pulse" /></td>
    <td className="px-5 py-4 text-right"><div className="w-8 h-8 bg-muted-surface rounded animate-pulse ml-auto" /></td>
  </tr>
);

interface PendingTransition { contract: Contract; to: ContractStatus; label: string; variant: 'success' | 'danger' | 'warning'; }

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminContractsPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContractStatus | undefined>(undefined);
  const { data: contracts, loading, error, refetch } = useAdminContracts({ status, search });
  const { pageData, pagination, goToPage, setPageSize, visiblePages } = usePagination(contracts ?? []);

  const [drawerContract, setDrawerContract] = useState<Contract | null>(null);
  const [pendingTransition, setPendingTransition] = useState<PendingTransition | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStatusUpdate = useCallback(async () => {
    if (!pendingTransition) return;
    setBusy(true); setActionError(null);
    try {
      await updateContractStatus(pendingTransition.contract.contractId, pendingTransition.to);
      refetch(); setPendingTransition(null);
      // close drawer if the updated contract is currently displayed
      if (drawerContract?.contractId === pendingTransition.contract.contractId) setDrawerContract(null);
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : 'Lỗi cập nhật trạng thái');
    } finally { setBusy(false); }
  }, [pendingTransition, refetch, drawerContract]);

  /** Generate a printable "contract" view in a new browser tab */
  const handlePrint = useCallback((c: Contract) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const amount = c.totalAmount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.totalAmount) : '—';
    win.document.write(`
      <!DOCTYPE html><html lang="vi">
      <head><meta charset="UTF-8"><title>Hợp đồng ${c.contractCode}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; font-size: 14px; }
        h1 { text-align:center; font-size:20px; margin-bottom:4px; }
        .subtitle { text-align:center; color:#666; margin-bottom:32px; }
        table { width:100%; border-collapse:collapse; margin:16px 0; }
        td { padding: 8px 12px; border:1px solid #ddd; }
        td:first-child { font-weight:600; width:35%; background:#f8f8f8; }
        .section { font-weight:700; font-size:13px; margin-top:24px; margin-bottom:8px; text-transform:uppercase; letter-spacing:.05em; color:#444; border-bottom:2px solid #ddd; padding-bottom:4px; }
        .footer { margin-top:48px; display:flex; justify-content:space-between; }
        .sig { text-align:center; width:200px; }
        .sig-line { border-top:1px solid #000; margin-top:48px; padding-top:4px; font-size:12px; }
        @media print { body { margin:20px } }
      </style></head>
      <body>
      <h1>HỢP ĐỒNG THUÊ XE</h1>
      <p class="subtitle">Mã: ${c.contractCode}</p>
      <div class="section">Thông tin hợp đồng</div>
      <table>
        <tr><td>Ngày tạo</td><td>${fmtDate(c.createdDate)}</td></tr>
        <tr><td>Ngày ký</td><td>${fmtDate(c.signedDate)}</td></tr>
        <tr><td>Trạng thái</td><td>${STATUS_BADGE[c.status]?.label ?? c.status}</td></tr>
        <tr><td>Đơn đặt xe</td><td>${c.bookingCode ?? '—'}</td></tr>
        <tr><td>Tổng tiền</td><td>${amount}</td></tr>
      </table>
      <div class="section">Thông tin khách hàng</div>
      <table>
        <tr><td>Họ tên</td><td>${c.userName ?? '—'}</td></tr>
        <tr><td>Email</td><td>${c.userEmail ?? '—'}</td></tr>
        <tr><td>Điện thoại</td><td>${c.userPhone ?? '—'}</td></tr>
      </table>
      <div class="section">Phương tiện</div>
      <table>
        <tr><td>Xe</td><td>${c.vehicleModel ?? '—'}</td></tr>
        <tr><td>Biển số</td><td>${c.licensePlate ?? '—'}</td></tr>
      </table>
      ${c.notes ? `<div class="section">Ghi chú</div><p>${c.notes}</p>` : ''}
      <div class="footer">
        <div class="sig"><div class="sig-line">Khách hàng</div></div>
        <div class="sig"><div class="sig-line">Đại diện EcoDana</div></div>
      </div>
      <script>window.onload=function(){window.print();}<\/script>
      </body></html>
    `);
    win.document.close();
  }, []);

  return (
    <>
      {pendingTransition && (
        <ConfirmDialog
          title={pendingTransition.label}
          message={`Xác nhận "${pendingTransition.label}" hợp đồng "${pendingTransition.contract.contractCode}"?`}
          confirmLabel={pendingTransition.label}
          confirmVariant={pendingTransition.variant}
          onConfirm={handleStatusUpdate}
          onCancel={() => setPendingTransition(null)}
          busy={busy}
        />
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        title="Chi tiết hợp đồng"
        subtitle={drawerContract?.contractCode}
        open={!!drawerContract}
        onClose={() => setDrawerContract(null)}
        width="lg"
      >
        {drawerContract && (
          <>
            <DetailSection title="Thông tin hợp đồng">
              <DetailRow label="Mã hợp đồng" value={drawerContract.contractCode} mono />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Trạng thái</span>
                <DetailBadge label={STATUS_BADGE[drawerContract.status]?.label ?? drawerContract.status} color={STATUS_BADGE[drawerContract.status]?.cls ?? ''} />
              </div>
              <DetailRow label="Ngày tạo" value={fmtDate(drawerContract.createdDate)} />
              <DetailRow label="Ngày ký" value={fmtDate(drawerContract.signedDate)} />
              <DetailRow label="Hoàn tất" value={fmtDate(drawerContract.completedDate)} />
              <DetailRow label="Mã đặt xe" value={drawerContract.bookingCode ?? '—'} mono />
              <DetailRow label="Tổng tiền" value={fmtVND(drawerContract.totalAmount)} />
              <DetailRow label="Điều khoản đã chấp nhận" value={drawerContract.termsAccepted ? 'Có' : 'Chưa'} />
            </DetailSection>

            <DetailSection title="Thông tin khách hàng">
              <DetailRow label="Họ tên" value={drawerContract.userName} />
              <DetailRow label="Email" value={drawerContract.userEmail} />
              <DetailRow label="Điện thoại" value={drawerContract.userPhone} />
            </DetailSection>

            <DetailSection title="Phương tiện">
              <DetailRow label="Model xe" value={drawerContract.vehicleModel} />
              <DetailRow label="Biển số" value={drawerContract.licensePlate} mono />
            </DetailSection>

            {(drawerContract.notes || drawerContract.cancellationReason) && (
              <div className="space-y-2">
                {drawerContract.notes && (
                  <div>
                    <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Ghi chú</span>
                    <p className="text-sm text-text-base leading-relaxed bg-canvas p-3 rounded-lg border border-border-color mt-1">{drawerContract.notes}</p>
                  </div>
                )}
                {drawerContract.cancellationReason && (
                  <div>
                    <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Lý do huỷ</span>
                    <p className="text-sm text-red-600 leading-relaxed bg-red-50 p-3 rounded-lg border border-red-100 mt-1">{drawerContract.cancellationReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons at drawer bottom */}
            <div className="flex gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePrint(drawerContract)}
                className="flex items-center gap-2 px-4 h-9 rounded-lg border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>In / Xuất PDF
              </button>
              {(STATUS_TRANSITIONS[drawerContract.status] ?? []).map((t) => (
                <button
                  key={t.to}
                  type="button"
                  onClick={() => setPendingTransition({ contract: drawerContract, ...t })}
                  className={`flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium transition-colors ${t.variant === 'success' ? 'bg-eco-green text-white hover:bg-eco-green-hover' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.variant === 'success' ? 'check_circle' : 'cancel'}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}
      </DetailDrawer>

      <AdminPageWrapper
        title="Quản lý hợp đồng"
        description="Theo dõi tình trạng hợp đồng thuê xe và hồ sơ liên quan."
        topControls={
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between items-center">
              <div className="w-full sm:w-72 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
                <input type="search" placeholder="Tìm kiếm hợp đồng..." value={search} onChange={(e) => setSearch(e.target.value)} className="block w-full h-10 pl-10 pr-3 border border-border-color rounded-lg bg-surface text-sm text-text-strong focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green" />
              </div>
              <select value={status || ''} onChange={(e) => setStatus((e.target.value as ContractStatus) || undefined)} className="h-10 px-3 border border-border-color rounded-lg text-sm text-text-base bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green appearance-none">
                <option value="">Tất cả trạng thái</option>
                <option value="Draft">Bản nháp</option>
                <option value="Signed">Đã ký</option>
                <option value="Completed">Hoàn tất</option>
                <option value="Cancelled">Đã hủy</option>
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
                  <th className="w-[14%] px-5 py-3 font-medium">Mã hợp đồng</th>
                  <th className="w-[22%] px-5 py-3 font-medium">Người thuê</th>
                  <th className="w-[22%] px-5 py-3 font-medium">Phương tiện</th>
                  <th className="w-[14%] px-5 py-3 font-medium">Ngày tạo</th>
                  <th className="w-[18%] px-5 py-3 font-medium">Trạng thái</th>
                  <th className="w-24 px-5 py-3 font-medium text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? <tr><td colSpan={6} className="px-5 py-8 text-center text-text-muted"><span className="material-symbols-outlined text-[40px] mb-2 block text-border-color">description</span>Không có hợp đồng nào</td></tr>
                    : pageData.map((c) => {
                        const transitions = STATUS_TRANSITIONS[c.status] ?? [];
                        return (
                          <tr key={c.contractId} className="hover:bg-canvas transition-colors cursor-pointer" onClick={() => setDrawerContract(c)}>
                            <td className="px-5 py-4 font-medium text-text-strong truncate font-mono">{c.contractCode}</td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col">
                                <span className="text-text-strong truncate">{c.userName || 'N/A'}</span>
                                <span className="text-text-muted text-xs truncate">{c.userEmail}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex flex-col">
                                <span className="text-text-strong truncate">{c.vehicleModel || '-'}</span>
                                <span className="text-text-muted text-xs truncate font-mono">{c.licensePlate}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-text-muted">{fmtDate(c.createdDate)}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_BADGE[c.status]?.cls ?? 'bg-gray-100 text-text-muted border-border-color'}`}>
                                {STATUS_BADGE[c.status]?.label ?? c.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <ActionMenu items={[
                                { label: 'Xem chi tiết', icon: 'visibility', onClick: () => setDrawerContract(c) },
                                { label: 'In / Xuất PDF', icon: 'print', onClick: () => handlePrint(c) },
                                ...(transitions.length > 0 ? [{ label: '---', icon: '', onClick: () => {} }] : []),
                                ...transitions.map((t) => ({
                                  label: t.label, icon: t.variant === 'success' ? 'check_circle' : 'cancel',
                                  variant: t.variant,
                                  onClick: () => setPendingTransition({ contract: c, ...t }),
                                })),
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

export default AdminContractsPage;
