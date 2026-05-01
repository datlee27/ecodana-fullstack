// ─── AdminVehiclesPage — with Approve / Reject / Delete actions ───────────────
import { useCallback, useState } from 'react';
import { useAdminVehicles, useDebounce } from '../../../hooks/useAdminData';
import { usePagination } from '../../../hooks/usePagination';
import { approveAdminVehicle, rejectAdminVehicle } from '../../../api/adminApi';
import Pagination from '../../../components/common/Pagination';
import AdminPageWrapper from '../../../components/common/AdminPageWrapper';
import { ActionMenu, ConfirmDialog, NotesDialog } from '../../../components/common/AdminActionMenu';
import type { AdminVehicle } from '../../../types/admin';

const STATUS_BADGE: Record<string, string> = {
  Available: 'bg-eco-green-soft text-eco-green',
  Rented: 'bg-mobility-blue-soft text-mobility-blue',
  PendingApproval: 'bg-orange-100 text-orange-600',
  Maintenance: 'bg-gray-100 text-text-muted',
  Unavailable: 'bg-red-100 text-red-600',
};
const STATUS_LABELS: Record<string, string> = {
  Available: 'Sẵn sàng', Rented: 'Đang thuê', PendingApproval: 'Chờ duyệt',
  Maintenance: 'Bảo dưỡng', Unavailable: 'Không khả dụng',
};

const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-muted-surface animate-pulse" /><div className="h-4 w-28 bg-muted-surface rounded animate-pulse" /></div></td>
    <td className="px-5 py-4"><div className="h-4 w-20 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-6 w-24 rounded-full bg-muted-surface animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 w-24 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4 text-right"><div className="w-8 h-8 rounded bg-muted-surface animate-pulse ml-auto" /></td>
  </tr>
);

type Dialog =
  | { type: 'approve'; vehicle: AdminVehicle }
  | { type: 'reject'; vehicle: AdminVehicle }
  | null;

const AdminVehiclesPage = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const debouncedSearch = useDebounce(search);
  const { data, loading, error, refetch } = useAdminVehicles(debouncedSearch, type);
  const vehicles: AdminVehicle[] = data?.vehicles ?? [];
  const { pageData, pagination, goToPage, setPageSize, visiblePages } = usePagination(vehicles);

  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const statusCounts = vehicles.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1; return acc;
  }, {});
  const kpi = [
    { label: 'Tổng phương tiện', value: data?.total, dot: 'bg-eco-green' },
    { label: 'Đang cho thuê', value: statusCounts['Rented'], dot: 'bg-mobility-blue' },
    { label: 'Chờ phê duyệt', value: statusCounts['PendingApproval'], dot: 'bg-warning' },
    { label: 'Bảo dưỡng', value: statusCounts['Maintenance'], dot: 'bg-gray-400' },
  ];

  const handleApprove = useCallback(async () => {
    if (!dialog || dialog.type !== 'approve') return;
    setBusy(true); setActionError(null);
    try { await approveAdminVehicle(dialog.vehicle.vehicleId); refetch(); setDialog(null); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi không xác định'); }
    finally { setBusy(false); }
  }, [dialog, refetch]);

  const handleReject = useCallback(async (reason: string) => {
    if (!dialog || dialog.type !== 'reject') return;
    setBusy(true); setActionError(null);
    try { await rejectAdminVehicle(dialog.vehicle.vehicleId, reason); refetch(); setDialog(null); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi không xác định'); }
    finally { setBusy(false); }
  }, [dialog, refetch]);

  return (
    <>
      {dialog?.type === 'approve' && (
        <ConfirmDialog
          title="Phê duyệt phương tiện"
          message={`Xác nhận phê duyệt "${dialog.vehicle.vehicleModel}"? Xe sẽ được hiển thị trên nền tảng.`}
          confirmLabel="Phê duyệt"
          confirmVariant="success"
          onConfirm={handleApprove}
          onCancel={() => setDialog(null)}
          busy={busy}
        />
      )}
      {dialog?.type === 'reject' && (
        <NotesDialog
          title={`Từ chối "${dialog.vehicle.vehicleModel}"`}
          placeholder="Lý do từ chối (bắt buộc)..."
          confirmLabel="Từ chối"
          confirmVariant="danger"
          onConfirm={handleReject}
          onCancel={() => setDialog(null)}
          busy={busy}
        />
      )}

      <AdminPageWrapper
        title="Quản lý phương tiện"
        description="Theo dõi đội xe và trạng thái hoạt động trên toàn hệ thống."
        topControls={
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {kpi.map(({ label, value, dot }) => (
                <div key={label} className="bg-surface border border-border-color rounded-xl p-5 flex flex-col">
                  <span className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />{label}
                  </span>
                  {loading ? <div className="h-8 w-20 bg-muted-surface rounded animate-pulse" /> : <p className="text-2xl font-bold text-text-strong">{value ?? 0}</p>}
                </div>
              ))}
            </div>
            {(error || actionError) && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error || actionError}</div>}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative w-72">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
                  <input type="search" placeholder="Tìm kiếm phương tiện..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-3 border border-border-color rounded-lg bg-surface text-sm text-text-strong focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green" />
                </div>
                <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 px-3 border border-border-color rounded-lg text-sm text-text-base bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green appearance-none">
                  <option value="">Loại xe</option><option value="Electric">Xe điện</option><option value="Motorcycle">Xe máy</option><option value="Scooter">Xe scooter</option>
                </select>
              </div>
            </div>
          </>
        }
        bottomControls={<Pagination pagination={pagination} visiblePages={visiblePages} onPageChange={goToPage} onPageSizeChange={setPageSize} />}
      >
        <div className="h-full flex flex-col bg-surface border border-border-color rounded-xl overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-auto scrollbar-elegant">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-muted-surface text-text-muted font-medium sticky top-0 z-10">
                <tr>
                  <th className="w-[35%] px-5 py-3 font-medium">Phương tiện</th>
                  <th className="w-[15%] px-5 py-3 font-medium">Loại</th>
                  <th className="w-[18%] px-5 py-3 font-medium">Trạng thái</th>
                  <th className="w-[22%] px-5 py-3 font-medium">Giá</th>
                  <th className="w-24 px-5 py-3 text-right font-medium whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? <tr><td colSpan={5} className="py-16 text-center text-sm text-text-muted"><span className="material-symbols-outlined text-[40px] mb-2 block text-border-color">two_wheeler</span>Không tìm thấy phương tiện phù hợp</td></tr>
                    : pageData.map((v) => (
                      <tr key={v.vehicleId} className="hover:bg-canvas transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {v.mainImageUrl
                              ? <img src={v.mainImageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-border-color shrink-0" />
                              : <div className="w-10 h-10 rounded-lg bg-muted-surface flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-text-muted text-[20px]">two_wheeler</span></div>
                            }
                            <div className="min-w-0">
                              <p className="font-medium text-text-strong text-sm truncate">{v.vehicleModel}</p>
                              <p className="text-xs text-text-muted truncate">{v.licensePlate ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-base truncate">{v.vehicleType ?? '—'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[v.status] ?? 'bg-gray-100 text-text-muted'}`}>
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60" />{STATUS_LABELS[v.status] ?? v.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-base">{v.dailyPrice ? v.dailyPrice.toLocaleString('vi-VN') + ' ₫/ngày' : '—'}</td>
                        <td className="px-5 py-4 text-right">
                          <ActionMenu items={[
                            ...(v.status === 'PendingApproval' ? [
                              { label: 'Phê duyệt', icon: 'check_circle', variant: 'success' as const, onClick: () => setDialog({ type: 'approve', vehicle: v }) },
                              { label: 'Từ chối', icon: 'cancel', variant: 'danger' as const, onClick: () => setDialog({ type: 'reject', vehicle: v }) },
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

export default AdminVehiclesPage;
