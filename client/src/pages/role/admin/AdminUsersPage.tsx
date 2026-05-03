// ─── AdminUsersPage — Full CRUD with Create/Edit Modal ───────────────────────
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePagination } from '../../../hooks/usePagination';
import { useDebounce } from '../../../hooks/useAdminData';
import { useAdminUsersList, useAdminUserMutations } from '../../../hooks/admin/useUsers';
import { userFormSchema, toUserRequest, type UserFormValues } from '../../../features/admin/schemas/userSchema';
import Pagination from '../../../components/common/Pagination';
import AdminPageWrapper from '../../../components/common/AdminPageWrapper';
import axiosClient from '../../../api/axios';
import type { ApiResponse } from '../../../types/api';
import type { AdminUser } from '../../../types/admin';

interface RoleOption { roleId: string; roleName: string; }

function useRoles() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  useEffect(() => {
    axiosClient
      .get<ApiResponse<RoleOption[]>>('/admin/users/api/roles')
      .then((r) => setRoles(r.data.data ?? []))
      .catch(() => setRoles([]));
  }, []);
  return roles;
}

// ── Static maps ───────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-eco-green-soft text-eco-green',
  Inactive: 'bg-gray-100 text-text-muted',
  Banned: 'bg-red-100 text-red-600',
};
const STATUS_LABEL: Record<string, string> = {
  Active: 'Hoạt động', Inactive: 'Không hoạt động', Banned: 'Bị khoá',
};
const ROLE_BADGE: Record<string, string> = {
  Admin: 'bg-mobility-blue-soft text-mobility-blue',
  Owner: 'bg-eco-green-soft text-eco-green',
  Staff: 'bg-orange-100 text-orange-600',
  Customer: 'bg-gray-100 text-text-muted',
};

// Hardcoded role list — backend roles are seeded and stable
const ROLES = [
  { id: 'admin-role-id',    name: 'Admin' },
  { id: 'owner-role-id',   name: 'Owner' },
  { id: 'staff-role-id',   name: 'Staff' },
  { id: 'customer-role-id', name: 'Customer' },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-muted-surface animate-pulse" /><div className="h-4 w-28 bg-muted-surface rounded animate-pulse" /></div></td>
    <td className="px-6 py-4"><div className="h-4 w-40 bg-muted-surface rounded animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-muted-surface animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-6 w-24 rounded-full bg-muted-surface animate-pulse" /></td>
    <td className="px-6 py-4 text-right"><div className="w-8 h-8 rounded bg-muted-surface animate-pulse ml-auto" /></td>
  </tr>
);

// ── Role modal (chỉ đổi vai trò — trạng thái có quick-action riêng) ─────────────────
function RoleStatusModal({
  user,
  onClose,
  onSubmit,
  busy,
  serverError,
  roles,
}: {
  user: AdminUser;
  onClose: () => void;
  onSubmit: (roleId: string) => Promise<void>;
  busy: boolean;
  serverError: string | null;
  roles: RoleOption[];
}) {
  const [roleId, setRoleId] = useState(user.roleId ?? '');
  const selCls = 'w-full h-9 px-3 border border-border-color rounded-lg text-sm text-text-strong bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
          <div>
            <h3 className="text-base font-semibold text-text-strong">Đổi vai trò</h3>
            <p className="text-xs text-text-muted mt-0.5">{user.username}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted-surface flex items-center justify-center text-text-muted">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{serverError}</div>
          )}
          <div className="bg-canvas rounded-xl border border-border-color p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-eco-green flex items-center justify-center text-sm font-semibold text-white uppercase shrink-0">
              {[user.firstName, user.lastName].filter(Boolean).map((n) => n![0]).join('') || user.username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-text-strong text-sm truncate">{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username}</p>
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Vai trò</label>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className={selCls}>
              <option value="">-- Chọn vai trò --</option>
              {roles.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-color">
          <button type="button" onClick={onClose} className="px-4 h-9 rounded-lg border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors">Huỷ</button>
          <button
            type="button"
            disabled={busy || !roleId}
            onClick={() => void onSubmit(roleId)}
            className="px-4 h-9 rounded-lg bg-eco-green text-white text-sm font-medium hover:bg-eco-green-hover transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {busy && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View modal (chỉ xem thông tin người dùng) ────────────────────────────────
function UserViewModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const lbl = 'text-xs font-medium text-text-muted w-32 shrink-0';
  const val = 'text-sm text-text-strong font-medium break-all';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-color shrink-0">
          <h3 className="text-lg font-semibold text-text-strong">Thông tin người dùng</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted-surface flex items-center justify-center text-text-muted transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Avatar + name */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-eco-green flex items-center justify-center text-2xl font-bold text-white uppercase shadow-md mb-3">
              {[user.firstName, user.lastName].filter(Boolean).map((n) => n![0]).join('') || user.username[0].toUpperCase()}
            </div>
            <h4 className="text-xl font-bold text-text-strong text-center">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username}
            </h4>
            <p className="text-sm text-text-muted mt-0.5">{user.email}</p>
            <div className="flex gap-2 mt-3">
              <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${STATUS_BADGE[user.status] ?? 'bg-gray-100 text-text-muted'}`}>
                {STATUS_LABEL[user.status] ?? user.status}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${ROLE_BADGE[user.roleName ?? ''] ?? 'bg-gray-100 text-text-muted'}`}>
                {user.roleName ?? 'Customer'}
              </span>
            </div>
          </div>

          {/* Detail rows */}
          <div className="bg-muted-surface rounded-xl border border-border-color divide-y divide-border-color">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className={lbl}>Tên đăng nhập</span>
              <span className={val}>{user.username}</span>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className={lbl}>Số điện thoại</span>
                <span className={val}>{user.phoneNumber}</span>
              </div>
            )}
            {user.driverLicense && (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className={lbl}>GPLX</span>
                <span className={val}>{user.driverLicense}</span>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className={lbl}>Ngày tham gia</span>
              <span className={val}>
                {user.createdDate
                  ? new Date(user.createdDate).toLocaleString('vi-VN')
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-color shrink-0">
          <button type="button" onClick={onClose} className="w-full h-10 rounded-xl bg-muted-surface border border-border-color text-text-strong font-medium text-sm hover:bg-canvas transition-colors">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionMenu({
  user,
  onView,
  onManage,
  onStatusChange,
  onBan,
}: {
  user: AdminUser;
  onView: (u: AdminUser) => void;
  onManage: (u: AdminUser) => void;
  onStatusChange: (id: string, s: 'Active' | 'Inactive' | 'Banned') => void;
  onBan: (u: AdminUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 160);
    }
    setOpen((o) => !o);
  };

  const dropCls = openUp
    ? 'absolute right-0 z-50 bottom-full mb-1 w-48 rounded-lg border border-border-color bg-surface shadow-lg py-1 text-sm'
    : 'absolute right-0 z-50 mt-1 w-48 rounded-lg border border-border-color bg-surface shadow-lg py-1 text-sm';

  return (
    <div ref={ref} className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="p-1.5 text-text-muted hover:text-text-strong hover:bg-muted-surface rounded-md transition-colors"
        aria-label="Thao tác"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>
      {open && (
        <div className={dropCls}>
          <button
            type="button"
            onClick={() => { onView(user); setOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-muted-surface text-text-base flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>Xem chi tiết
          </button>
          <button
            type="button"
            onClick={() => { onManage(user); setOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-muted-surface text-text-base flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">manage_accounts</span>Vai trò
          </button>
          {user.status !== 'Active' && (
            <button
              type="button"
              onClick={() => { onStatusChange(user.id, 'Active'); setOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-muted-surface text-eco-green flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>Kích hoạt
            </button>
          )}
          {user.status !== 'Banned' && (
            <button
              type="button"
              onClick={() => { onBan(user); setOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-muted-surface text-orange-600 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">block</span>Khoá tài khoản
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Confirm Ban dialog ────────────────────────────────────────────────────────
function ConfirmBanDialog({
  user,
  onConfirm,
  onCancel,
  busy,
}: {
  user: AdminUser;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="bg-surface w-full max-w-sm rounded-2xl shadow-xl z-10 p-6 space-y-5">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-600 text-[28px]">block</span>
          </div>
          <h3 className="text-lg font-bold text-text-strong">Khoá tài khoản?</h3>
          <p className="text-sm text-text-base leading-relaxed">
            Tài khoản <span className="font-semibold text-text-strong">{name}</span> sẽ bị khóa và không thể đăng nhập vào hệ thống.<br />
            Bạn có chắc chắn muốn tiếp tục?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 h-10 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            Khoá tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form field wrapper ────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full h-9 px-3 border ${err ? 'border-red-400' : 'border-border-color'} rounded-lg text-sm text-text-strong bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green`;

// ── Create/Edit Modal ─────────────────────────────────────────────────────────
function UserFormModal({
  editingUser,
  onClose,
  onSubmit,
  busy,
  serverError,
  roles,
}: {
  editingUser: AdminUser | null;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
  busy: boolean;
  serverError: string | null;
  roles: RoleOption[];
}) {
  const isEditing = editingUser !== null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: isEditing
      ? {
          username: editingUser.username,
          email: editingUser.email,
          password: '',
          firstName: editingUser.firstName ?? '',
          lastName: editingUser.lastName ?? '',
          phoneNumber: editingUser.phoneNumber ?? '',
          avatarUrl: editingUser.avatarUrl ?? '',
          roleId: editingUser.roleId ?? '',
          status: (editingUser.status as 'Active' | 'Inactive' | 'Banned') ?? 'Active',
          gender: '',
          emailVerified: false,
          twoFactorEnabled: false,
          lockoutEnabled: false,
        }
      : {
          username: '', email: '', password: '',
          firstName: '', lastName: '', phoneNumber: '', avatarUrl: '',
          roleId: '', status: 'Active', gender: '',
          emailVerified: false, twoFactorEnabled: false, lockoutEnabled: false,
        },
  });

  // Reset form when modal opens/changes user
  useEffect(() => { reset(); }, [editingUser, reset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-color">
          <h3 className="text-base font-semibold text-text-strong">
            {isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
          </h3>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted-surface flex items-center justify-center text-text-muted">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form
          id="user-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          noValidate
        >
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Họ" error={errors.firstName?.message}>
              <input {...register('firstName')} className={inputCls(errors.firstName?.message)} placeholder="Nguyễn" />
            </Field>
            <Field label="Tên" error={errors.lastName?.message}>
              <input {...register('lastName')} className={inputCls(errors.lastName?.message)} placeholder="Văn A" />
            </Field>
          </div>

          <Field label="Tên đăng nhập *" error={errors.username?.message}>
            <input {...register('username')} className={inputCls(errors.username?.message)} placeholder="username" autoComplete="off" />
          </Field>

          <Field label="Email *" error={errors.email?.message}>
            <input type="email" {...register('email')} className={inputCls(errors.email?.message)} placeholder="user@example.com" />
          </Field>

          <Field label={isEditing ? 'Mật khẩu mới (để trống giữ nguyên)' : 'Mật khẩu *'} error={errors.password?.message}>
            <input type="password" {...register('password')} className={inputCls(errors.password?.message)} autoComplete="new-password" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Vai trò *" error={errors.roleId?.message}>
              <select {...register('roleId')} className={inputCls(errors.roleId?.message)}>
                <option value="">-- Chọn vai trò --</option>
                {roles.map((r) => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái *" error={errors.status?.message}>
              <select {...register('status')} className={inputCls(errors.status?.message)}>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
                <option value="Banned">Bị khoá</option>
              </select>
            </Field>
          </div>

          <Field label="Số điện thoại" error={errors.phoneNumber?.message}>
            <input {...register('phoneNumber')} className={inputCls(errors.phoneNumber?.message)} placeholder="0901234567" />
          </Field>

          <Field label="Avatar URL" error={errors.avatarUrl?.message}>
            <input {...register('avatarUrl')} className={inputCls(errors.avatarUrl?.message)} placeholder="https://..." />
          </Field>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-color">
          <button type="button" onClick={onClose} className="px-4 h-9 rounded-lg border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors">
            Huỷ
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={busy}
            className="px-4 h-9 rounded-lg bg-eco-green text-white text-sm font-medium hover:bg-eco-green-hover transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {busy && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {isEditing ? 'Lưu thay đổi' : 'Tạo người dùng'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────
function ConfirmDeleteDialog({
  username,
  onConfirm,
  onCancel,
  busy,
}: {
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-red-600 text-[24px]">warning</span>
        </div>
        <p className="text-center text-sm text-text-base">
          Bạn có chắc muốn xoá người dùng <span className="font-semibold text-text-strong">{username}</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3 justify-center">
          <button type="button" onClick={onCancel} className="px-4 h-9 rounded-lg border border-border-color text-sm text-text-base hover:bg-muted-surface transition-colors">
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {busy && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const roles = useRoles();

  const { users, total, loading, error, refetch } = useAdminUsersList({
    search: debouncedSearch,
    role,
    status,
  });

  const { createUser, updateUser, updateRole, deleteUser, updateStatus, busy, mutError } =
    useAdminUserMutations(refetch);

  const { pageData, pagination, goToPage, setPageSize, visiblePages } = usePagination(users);

  // Create modal state (for new system accounts only)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);
  const [managingUser, setManagingUser] = useState<AdminUser | null>(null);

  const openCreate = () => setCreateModalOpen(true);
  const closeCreate = () => setCreateModalOpen(false);

  const handleCreateSubmit = async (values: UserFormValues) => {
    const dto = toUserRequest(values, false);
    await createUser(dto);
    closeCreate();
  };

  const handleRoleStatusSubmit = async (roleId: string) => {
    if (!managingUser) return;
    await updateRole(managingUser.id, roleId);
    setManagingUser(null);
  };

  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);

  const handleStatusChange = async (id: string, s: 'Active' | 'Inactive' | 'Banned') => {
    await updateStatus(id, s);
  };

  const handleBanConfirm = async () => {
    if (!banTarget) return;
    await updateStatus(banTarget.id, 'Banned');
    setBanTarget(null);
  };

  const initials = (u: AdminUser) =>
    [u.firstName, u.lastName].filter(Boolean).map((n) => n![0]).join('') ||
    u.username[0].toUpperCase();

  return (
    <>
      {viewingUser && (
        <UserViewModal user={viewingUser} onClose={() => setViewingUser(null)} />
      )}
      {createModalOpen && (
        <UserFormModal
          editingUser={null}
          onClose={closeCreate}
          onSubmit={handleCreateSubmit}
          busy={busy}
          serverError={mutError}
          roles={roles}
        />
      )}
      {managingUser && (
        <RoleStatusModal
          user={managingUser}
          onClose={() => setManagingUser(null)}
          onSubmit={handleRoleStatusSubmit}
          busy={busy}
          serverError={mutError}
          roles={roles}
        />
      )}
      {banTarget && (
        <ConfirmBanDialog
          user={banTarget}
          onConfirm={handleBanConfirm}
          onCancel={() => setBanTarget(null)}
          busy={busy}
        />
      )}

      <AdminPageWrapper
        title="Quản lý người dùng"
        description="Quản lý tài khoản nền tảng, vai trò và trạng thái hoạt động."
        topControls={
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={openCreate}
                className="bg-eco-green hover:bg-eco-green-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 h-10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>Thêm người dùng
              </button>
              {total > 0 && (
                <p className="text-sm text-text-muted">
                  Tổng cộng: <span className="font-semibold text-text-strong">{total}</span> người dùng
                </p>
              )}
            </div>
            <div className="bg-surface border border-border-color rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center flex-1">
                <div className="relative w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</span>
                  <input
                    type="search"
                    placeholder="Tìm người dùng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-surface border border-border-color rounded-lg text-sm text-text-strong focus:outline-none focus:ring-1 focus:ring-eco-green focus:border-eco-green"
                  />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-10 py-2 pl-3 pr-10 bg-surface border border-border-color rounded-lg text-sm text-text-base focus:outline-none focus:ring-1 focus:ring-eco-green appearance-none"
                >
                  <option value="">Vai trò</option>
                  <option value="Customer">Khách hàng</option>
                  <option value="Owner">Chủ xe</option>
                  <option value="Staff">Nhân viên</option>
                  <option value="Admin">Admin</option>
                </select>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 py-2 pl-3 pr-10 bg-surface border border-border-color rounded-lg text-sm text-text-base focus:outline-none focus:ring-1 focus:ring-eco-green appearance-none"
                >
                  <option value="">Trạng thái</option>
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Không hoạt động</option>
                  <option value="Banned">Bị khoá</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => { setSearch(''); setRole(''); setStatus(''); }}
                className="text-sm text-text-muted hover:text-text-strong font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
          </>
        }
        bottomControls={
          <Pagination pagination={pagination} visiblePages={visiblePages} onPageChange={goToPage} onPageSizeChange={setPageSize} />
        }
      >
        <div className="h-full flex flex-col bg-surface border border-border-color rounded-xl overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-scroll overflow-x-auto scrollbar-elegant">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-muted-surface text-text-muted font-medium sticky top-0 z-10">
                <tr>
                  <th className="w-[28%] px-6 py-3 font-medium">Tên người dùng</th>
                  <th className="w-[30%] px-6 py-3 font-medium">Email</th>
                  <th className="w-[16%] px-6 py-3 font-medium">Vai trò</th>
                  <th className="w-[18%] px-6 py-3 font-medium">Trạng thái</th>
                  <th className="w-24 px-6 py-3 text-right font-medium whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : pageData.length === 0
                    ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-sm text-text-muted">
                          <span className="material-symbols-outlined text-[40px] mb-2 block text-border-color">group_off</span>
                          Không tìm thấy người dùng phù hợp
                        </td>
                      </tr>
                    )
                    : pageData.map((u) => (
                      <tr key={u.id} className="hover:bg-canvas transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                              : <div className="w-9 h-9 rounded-full bg-eco-green flex items-center justify-center text-sm font-semibold text-white uppercase shrink-0">{initials(u)}</div>
                            }
                            <div className="min-w-0">
                              <p className="font-medium text-text-strong text-sm truncate">
                                {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.username}
                              </p>
                              <p className="text-xs text-text-muted truncate">{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-base truncate">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[u.roleName ?? ''] ?? 'bg-gray-100 text-text-muted'}`}>
                            {u.roleName ?? 'Khách hàng'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[u.status] ?? 'bg-gray-100 text-text-muted'}`}>
                            {STATUS_LABEL[u.status] ?? u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionMenu
                            user={u}
                            onView={(usr) => setViewingUser(usr)}
                            onManage={(usr) => setManagingUser(usr)}
                            onStatusChange={handleStatusChange}
                            onBan={(usr) => setBanTarget(usr)}
                          />
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

export default AdminUsersPage;
