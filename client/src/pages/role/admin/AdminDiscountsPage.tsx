// ─── AdminDiscountsPage — Full CRUD + Toggle + Detail Drawer ──────────────────
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdminDiscounts, useDiscountMutations, useDiscountStats } from '../../../hooks/admin';
import { toggleDiscountStatus } from '../../../api/admin/discounts';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../../components/common/Pagination';
import AdminPageWrapper from '../../../components/common/AdminPageWrapper';
import { ActionMenu, ConfirmDialog } from '../../../components/common/AdminActionMenu';
import { DetailDrawer, DetailRow, DetailSection, DetailBadge } from '../../../components/common/DetailDrawer';
import { discountFormSchema, toDiscountRequest, type DiscountFormValues } from '../../../features/admin/schemas/discountSchema';
import type { Discount } from '../../../types/admin';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
const fmtVND = (v?: number) => v != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v) : '—';

const inputCls = (err?: string) =>
  `w-full h-9 px-3 border ${err ? 'border-red-400' : 'border-border-color'} rounded-lg text-sm text-text-strong bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Discount Form Modal ────────────────────────────────────────────────────────
function DiscountModal({
  editingDiscount,
  onClose,
  onSubmit,
  busy,
  serverError,
}: {
  editingDiscount: Discount | null;
  onClose: () => void;
  onSubmit: (v: DiscountFormValues) => Promise<void>;
  busy: boolean;
  serverError: string | null;
}) {
  const isEditing = editingDiscount !== null;
  const { register, handleSubmit, watch, formState: { errors } } = useForm<DiscountFormValues>({
    resolver: zodResolver(discountFormSchema),
    defaultValues: isEditing
      ? {
          discountName: editingDiscount.discountName,
          description: editingDiscount.description ?? '',
          discountType: editingDiscount.discountType,
          discountValue: editingDiscount.discountValue,
          startDate: editingDiscount.startDate?.slice(0, 10) ?? '',
          endDate: editingDiscount.endDate?.slice(0, 10) ?? '',
          isActive: editingDiscount.isActive,
          voucherCode: editingDiscount.voucherCode ?? '',
          minOrderAmount: editingDiscount.minOrderAmount ?? 0,
          maxDiscountAmount: editingDiscount.maxDiscountAmount ?? undefined,
          usageLimit: editingDiscount.usageLimit ?? undefined,
          discountCategory: editingDiscount.discountCategory ?? '',
        }
      : {
          discountName: '', description: '', discountType: 'Percentage',
          discountValue: 10, startDate: '', endDate: '', isActive: true,
          voucherCode: '', minOrderAmount: 0,
        },
  });

  const discountType = watch('discountType');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
          <h3 className="text-base font-semibold text-text-strong">
            {isEditing ? 'Chỉnh sửa ưu đãi' : 'Tạo ưu đãi mới'}
          </h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted-surface flex items-center justify-center text-text-muted">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form id="discount-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-5 scrollbar-elegant" noValidate>
          {serverError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</div>
          )}

          <div className="space-y-4">
            {/* Row 1 */}
            <Field label="Tên chiến dịch *" error={errors.discountName?.message}>
              <input {...register('discountName')} className={inputCls(errors.discountName?.message)} placeholder="Khuyến mãi mùa hè..." />
            </Field>

            <Field label="Mô tả" error={errors.description?.message}>
              <textarea {...register('description')} rows={2} className={`${inputCls()} h-auto py-2 resize-none`} placeholder="Mô tả ngắn về chương trình..." />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Loại giảm giá *" error={errors.discountType?.message}>
                <select {...register('discountType')} className={inputCls(errors.discountType?.message)}>
                  <option value="Percentage">Phần trăm (%)</option>
                  <option value="FixedAmount">Số tiền cố định (₫)</option>
                </select>
              </Field>
              <Field label={discountType === 'Percentage' ? 'Mức giảm (%) *' : 'Số tiền giảm (₫) *'} error={errors.discountValue?.message}>
                <input type="number" {...register('discountValue')} className={inputCls(errors.discountValue?.message)} placeholder={discountType === 'Percentage' ? '10' : '50000'} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Ngày bắt đầu *" error={errors.startDate?.message}>
                <input type="date" {...register('startDate')} className={inputCls(errors.startDate?.message)} />
              </Field>
              <Field label="Ngày kết thúc *" error={errors.endDate?.message}>
                <input type="date" {...register('endDate')} className={inputCls(errors.endDate?.message)} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Mã voucher" error={errors.voucherCode?.message}>
                <input {...register('voucherCode')} className={inputCls(errors.voucherCode?.message)} placeholder="SUMMER2025" />
              </Field>
              <Field label="Danh mục" error={errors.discountCategory?.message}>
                <input {...register('discountCategory')} className={inputCls(errors.discountCategory?.message)} placeholder="Xe máy, Xe điện..." />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Đơn tối thiểu (₫)" error={errors.minOrderAmount?.message}>
                <input type="number" {...register('minOrderAmount')} className={inputCls(errors.minOrderAmount?.message)} placeholder="0" />
              </Field>
              <Field label="Giảm tối đa (₫)" error={errors.maxDiscountAmount?.message}>
                <input type="number" {...register('maxDiscountAmount')} className={inputCls(errors.maxDiscountAmount?.message)} placeholder="Không giới hạn" />
              </Field>
              <Field label="Số lượt dùng" error={errors.usageLimit?.message}>
                <input type="number" {...register('usageLimit')} className={inputCls(errors.usageLimit?.message)} placeholder="Không giới hạn" />
              </Field>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input type="checkbox" {...register('isActive')} id="isActive" className="w-4 h-4 accent-eco-green" />
              <label htmlFor="isActive" className="text-sm text-text-base cursor-pointer">Kích hoạt ngay sau khi tạo</label>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-color">
          <button type="button" onClick={onClose} className="px-4 h-9 rounded-lg border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors">Huỷ</button>
          <button type="submit" form="discount-form" disabled={busy} className="px-4 h-9 rounded-lg bg-eco-green text-white text-sm font-medium hover:bg-eco-green-hover transition-colors disabled:opacity-60 flex items-center gap-2">
            {busy && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {isEditing ? 'Lưu thay đổi' : 'Tạo ưu đãi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    <td className="px-5 py-4"><div className="h-4 w-32 bg-muted-surface rounded animate-pulse mb-2" /><div className="h-3 w-20 bg-muted-surface rounded animate-pulse opacity-70" /></td>
    <td className="px-5 py-4"><div className="h-4 w-24 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 w-28 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-4 w-16 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-5 py-4"><div className="h-6 w-16 bg-muted-surface rounded-full animate-pulse" /></td>
    <td className="px-5 py-4 text-right"><div className="h-8 w-20 bg-muted-surface rounded animate-pulse ml-auto" /></td>
  </tr>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminDiscountsPage = () => {
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const { data: discounts, loading, error, refetch } = useAdminDiscounts({ search, isActive });
  const { data: stats, loading: statsLoading } = useDiscountStats();
  const { create, update, remove, loading: mutLoading, error: mutError } = useDiscountMutations();
  const { pageData, pagination, goToPage, setPageSize, visiblePages } = usePagination(discounts ?? []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Discount | null>(null);
  const [drawerDiscount, setDrawerDiscount] = useState<Discount | null>(null);
  const [toggleBusy, setToggleBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openCreate = () => { setEditingDiscount(null); setModalOpen(true); };
  const openEdit = (d: Discount) => { setEditingDiscount(d); setModalOpen(true); };

  const handleSubmit = useCallback(async (values: DiscountFormValues) => {
    const dto = toDiscountRequest(values) as Parameters<typeof create>[0];
    if (editingDiscount) { await update(editingDiscount.discountId, dto as Parameters<typeof update>[1]); }
    else { await create(dto); }
    setModalOpen(false);
    refetch();
  }, [editingDiscount, create, update, refetch]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try { await remove(deleteTarget.discountId); setDeleteTarget(null); refetch(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi xoá'); }
  }, [deleteTarget, remove, refetch]);

  const handleToggle = useCallback(async (d: Discount) => {
    setToggleBusy(d.discountId); setActionError(null);
    try { await toggleDiscountStatus(d.discountId); refetch(); }
    catch (e: unknown) { setActionError(e instanceof Error ? e.message : 'Lỗi đổi trạng thái'); }
    finally { setToggleBusy(null); }
  }, [refetch]);

  const kpiData = statsLoading || !stats
    ? [{ label: 'Tổng ưu đãi', value: '-', dot: 'bg-eco-green' }, { label: 'Đang hoạt động', value: '-', dot: 'bg-success' }, { label: 'Ngừng', value: '-', dot: 'bg-text-muted' }]
    : [{ label: 'Tổng ưu đãi', value: String(stats.total ?? 0), dot: 'bg-eco-green' }, { label: 'Đang hoạt động', value: String(stats.active ?? 0), dot: 'bg-success' }, { label: 'Ngừng', value: String(stats.inactive ?? 0), dot: 'bg-text-muted' }];

  return (
    <>
      {modalOpen && (
        <DiscountModal
          editingDiscount={editingDiscount}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          busy={mutLoading}
          serverError={mutError}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Xoá ưu đãi"
          message={`Bạn có chắc muốn xoá "${deleteTarget.discountName}"? Hành động này không thể hoàn tác.`}
          confirmLabel="Xoá"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          busy={mutLoading}
        />
      )}

      {/* Detail Drawer */}
      <DetailDrawer
        title="Chi tiết ưu đãi"
        subtitle={drawerDiscount?.discountName}
        open={!!drawerDiscount}
        onClose={() => setDrawerDiscount(null)}
      >
        {drawerDiscount && (
          <>
            <DetailSection title="Thông tin chung">
              <DetailRow label="Tên chiến dịch" value={drawerDiscount.discountName} />
              <DetailRow label="Mã voucher" value={drawerDiscount.voucherCode || 'Không có'} mono />
              <DetailRow label="Loại giảm" value={drawerDiscount.discountType === 'Percentage' ? 'Phần trăm (%)' : 'Số tiền cố định (₫)'} />
              <DetailRow label="Mức giảm" value={drawerDiscount.discountType === 'Percentage' ? `${drawerDiscount.discountValue}%` : fmtVND(drawerDiscount.discountValue)} />
            </DetailSection>
            <DetailSection title="Điều kiện áp dụng">
              <DetailRow label="Đơn tối thiểu" value={fmtVND(drawerDiscount.minOrderAmount)} />
              <DetailRow label="Giảm tối đa" value={drawerDiscount.maxDiscountAmount ? fmtVND(drawerDiscount.maxDiscountAmount) : 'Không giới hạn'} />
              <DetailRow label="Giới hạn dùng" value={drawerDiscount.usageLimit ? String(drawerDiscount.usageLimit) : 'Không giới hạn'} />
              <DetailRow label="Đã dùng" value={String(drawerDiscount.usedCount)} />
            </DetailSection>
            <DetailSection title="Thời hạn">
              <DetailRow label="Bắt đầu" value={fmtDate(drawerDiscount.startDate)} />
              <DetailRow label="Kết thúc" value={fmtDate(drawerDiscount.endDate)} />
              <DetailRow label="Ngày tạo" value={fmtDate(drawerDiscount.createdDate)} />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Trạng thái</span>
                <DetailBadge
                  label={drawerDiscount.isActive ? 'Đang hoạt động' : 'Ngừng'}
                  color={drawerDiscount.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-text-muted/10 text-text-muted border-text-muted/20'}
                />
              </div>
            </DetailSection>
            {drawerDiscount.description && (
              <div className="space-y-1">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wide">Mô tả</span>
                <p className="text-sm text-text-base leading-relaxed bg-canvas p-3 rounded-lg border border-border-color">{drawerDiscount.description}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setDrawerDiscount(null); openEdit(drawerDiscount); }} className="flex-1 h-9 rounded-lg border border-eco-green text-eco-green text-sm font-medium hover:bg-eco-green-soft transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">edit</span>Chỉnh sửa
              </button>
              <button type="button" onClick={() => handleToggle(drawerDiscount)} disabled={toggleBusy === drawerDiscount.discountId} className="flex-1 h-9 rounded-lg border border-border-color text-text-base text-sm font-medium hover:bg-muted-surface transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-[16px]">{drawerDiscount.isActive ? 'pause_circle' : 'play_circle'}</span>
                {drawerDiscount.isActive ? 'Tạm dừng' : 'Kích hoạt'}
              </button>
            </div>
          </>
        )}
      </DetailDrawer>

      <AdminPageWrapper
        title="Quản lý ưu đãi"
        description="Theo dõi chương trình khuyến mãi và mã giảm giá của nền tảng."
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <button type="button" onClick={openCreate} className="bg-eco-green hover:bg-eco-green-hover text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 h-10 transition-colors shrink-0">
                <span className="material-symbols-outlined text-[20px]">add</span>Tạo ưu đãi mới
              </button>
            </div>
            {(error || actionError || mutError) && <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4 mb-4"><p>Lỗi: {error || actionError || mutError}</p></div>}
          </>
        }
        bottomControls={<Pagination pagination={pagination} visiblePages={visiblePages} onPageChange={goToPage} onPageSizeChange={setPageSize} />}
      >
        <div className="h-full flex flex-col bg-surface border border-border-color rounded-xl overflow-hidden">
          <div className="flex-none p-4 border-b border-border-color flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
              <input type="search" placeholder="Tìm kiếm ưu đãi..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-9 pr-3 border border-border-color rounded-lg text-sm text-text-strong focus:border-eco-green focus:ring-1 focus:ring-eco-green outline-none bg-surface" />
            </div>
            <select value={isActive === undefined ? '' : isActive ? 'active' : 'inactive'} onChange={(e) => { const v = e.target.value; setIsActive(v === '' ? undefined : v === 'active'); }} className="h-10 px-3 border border-border-color rounded-lg text-sm text-text-base bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green appearance-none">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng</option>
            </select>
          </div>

          <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-auto scrollbar-elegant">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-muted-surface text-text-muted font-medium sticky top-0 z-10">
                <tr>
                  <th className="w-[28%] px-5 py-3 font-medium">Tên chiến dịch / Mã</th>
                  <th className="w-[14%] px-5 py-3 font-medium">Quy tắc</th>
                  <th className="w-[22%] px-5 py-3 font-medium">Thời hạn</th>
                  <th className="w-[12%] px-5 py-3 font-medium">Sử dụng</th>
                  <th className="w-[14%] px-5 py-3 font-medium">Trạng thái</th>
                  <th className="w-24 px-5 py-3 font-medium text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? <tr><td colSpan={6} className="px-5 py-8 text-center text-text-muted"><span className="material-symbols-outlined text-[40px] mb-2 block text-border-color">local_offer</span>Không có ưu đãi nào</td></tr>
                    : pageData.map((d) => (
                      <tr key={d.discountId} className="hover:bg-canvas transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-text-strong font-medium truncate">{d.discountName}</span>
                            <span className="text-text-muted text-xs truncate font-mono">{d.voucherCode || 'Không có mã'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-text-strong">{d.discountType === 'Percentage' ? `${d.discountValue}%` : fmtVND(d.discountValue)}</span>
                        </td>
                        <td className="px-5 py-4 text-text-muted text-xs">{fmtDate(d.startDate)} – {fmtDate(d.endDate)}</td>
                        <td className="px-5 py-4"><span className="text-text-strong">{d.usedCount}/{d.usageLimit || '∞'}</span></td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={toggleBusy === d.discountId}
                            onClick={() => handleToggle(d)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border transition-opacity ${d.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-text-muted/10 text-text-muted border-text-muted/20'} hover:opacity-70 disabled:opacity-40`}
                            title="Nhấn để bật/tắt"
                          >
                            {toggleBusy === d.discountId ? '...' : d.isActive ? 'Đang hoạt động' : 'Ngừng'}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ActionMenu items={[
                            { label: 'Xem chi tiết', icon: 'visibility', onClick: () => setDrawerDiscount(d) },
                            { label: 'Chỉnh sửa', icon: 'edit', onClick: () => openEdit(d) },
                            { label: d.isActive ? 'Tạm dừng' : 'Kích hoạt', icon: d.isActive ? 'pause_circle' : 'play_circle', variant: 'warning', onClick: () => handleToggle(d) },
                            { label: '---', icon: '', onClick: () => {} },
                            { label: 'Xoá', icon: 'delete', variant: 'danger', onClick: () => setDeleteTarget(d) },
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

export default AdminDiscountsPage;
