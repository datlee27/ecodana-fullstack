/**
 * AdminDashboardPage — Redesigned with:
 * - Real-time KPI cards (active vehicles, new users, bookings today, pending approvals)
 * - Revenue summary cards (today / this month / total)
 * - Monthly Revenue bar chart (Recharts, 6 months)
 * - Booking status donut chart
 * - System status panel
 * - Quick action shortcuts
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAdminAnalytics } from '../../../hooks/useAdminData';
import type { MonthlyRevenuePoint } from '../../../types/admin';

// ── helpers ────────────────────────────────────────────────────────────────────
const fmt = (n?: number) =>
  n != null ? n.toLocaleString('vi-VN') + ' ₫' : '—';

const fmtShort = (n?: number) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M ₫';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K ₫';
  return n.toLocaleString('vi-VN') + ' ₫';
};

// ── StatCard ───────────────────────────────────────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  sub,
  loading,
  iconBg,
  iconColor,
  onClick,
}: {
  icon: string;
  label: string;
  value?: number | string;
  sub?: string;
  loading: boolean;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}) => (
  <div
    className={`bg-surface border border-border-color rounded-2xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>{icon}</span>
      </div>
      {sub && <span className="text-xs text-text-muted">{sub}</span>}
    </div>
    <div>
      <p className="text-xs font-medium text-text-muted mb-0.5">{label}</p>
      {loading ? (
        <div className="h-7 w-20 bg-muted-surface rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-text-strong">{value ?? '—'}</p>
      )}
    </div>
  </div>
);

// ── RevenueCard ────────────────────────────────────────────────────────────────
const RevenueCard = ({
  label,
  value,
  loading,
  accent,
}: {
  label: string;
  value?: number;
  loading: boolean;
  accent?: boolean;
}) => (
  <div className={`rounded-2xl p-5 border ${accent ? 'bg-eco-green border-eco-green/20' : 'bg-surface border-border-color'}`}>
    <p className={`text-xs font-medium mb-1 ${accent ? 'text-white/70' : 'text-text-muted'}`}>{label}</p>
    {loading ? (
      <div className="h-7 w-28 bg-white/20 rounded animate-pulse" />
    ) : (
      <p className={`text-xl font-bold ${accent ? 'text-white' : 'text-text-strong'}`}>{fmt(value)}</p>
    )}
  </div>
);

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border-color rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-text-strong mb-1">{label}</p>
      <p className="text-eco-green">{fmtShort(payload[0].value)}</p>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
  const { data: analytics, loading, error } = useAdminAnalytics();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');

  // Select the appropriate data array based on timeRange
  const sourceData =
    timeRange === 'day'
      ? analytics?.dailyRevenue
      : timeRange === 'year'
      ? analytics?.yearlyRevenue
      : analytics?.monthlyRevenue;

  // Build chart data
  const chartData: { label: string; revenue: number }[] =
    Array.isArray(sourceData) && sourceData.length > 0
      ? sourceData.map((p) => ({
          label: p.label,
          revenue: p.revenue,
        }))
      : [];

  const timeRangeLabel =
    timeRange === 'day' ? '7 ngày gần nhất' : timeRange === 'year' ? '5 năm gần nhất' : '6 tháng gần nhất';

  // Donut chart — booking status breakdown
  const bookingPie = [
    { name: 'Đang thuê', value: analytics?.activeBookings ?? 0,   color: '#16a34a' },
    { name: 'Chờ duyệt', value: analytics?.pendingBookings ?? 0,  color: '#f97316' },
    { name: 'Hoàn thành', value: (analytics?.totalBookings ?? 0) - (analytics?.activeBookings ?? 0) - (analytics?.pendingBookings ?? 0) - (analytics?.cancelledBookings ?? 0), color: '#3b82f6' },
    { name: 'Đã huỷ',    value: analytics?.cancelledBookings ?? 0, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Quick actions
  const quickActions = [
    { icon: 'group',            label: 'Quản lý người dùng', to: '/admin/users'     },
    { icon: 'electric_scooter', label: 'Phê duyệt xe',       to: '/admin/vehicles'  },
    { icon: 'receipt_long',     label: 'Xem đơn đặt xe',     to: '/admin/bookings'  },
    { icon: 'payments',         label: 'Kiểm tra thanh toán', to: '/admin/payments'  },
    { icon: 'assignment_return',label: 'Xử lý hoàn tiền',    to: '/admin/refunds'   },
    { icon: 'local_offer',      label: 'Tạo ưu đãi mới',     to: '/admin/discounts' },
  ];

  return (
    <div className="space-y-7">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div data-shell-zone="page-heading">
        <h2 className="text-2xl font-bold text-text-strong">Tổng quan vận hành</h2>
        <p className="text-sm text-text-muted mt-1">Theo dõi hoạt động hệ thống EcoDana thời gian thực.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}

      {/* ── KPI Row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="two_wheeler"  label="Phương tiện sẵn sàng" value={analytics?.availableVehicles} loading={loading} iconBg="bg-eco-green-soft"         iconColor="text-eco-green"       onClick={() => navigate('/admin/vehicles')} />
        <StatCard icon="group"        label="Người dùng mới hôm nay" value={analytics?.newUsersToday}    loading={loading} iconBg="bg-blue-50"                 iconColor="text-blue-600"        onClick={() => navigate('/admin/users')} />
        <StatCard icon="receipt_long" label="Đơn đặt xe hôm nay"    value={analytics?.bookingsToday}    loading={loading} iconBg="bg-indigo-50"               iconColor="text-indigo-600"      onClick={() => navigate('/admin/bookings')} />
        <StatCard icon="warning"      label="Chờ phê duyệt"          value={analytics?.pendingApprovals} loading={loading} iconBg="bg-orange-50"               iconColor="text-orange-500"      sub={analytics?.pendingApprovals ? `${analytics.pendingApprovals} xe` : undefined} onClick={() => navigate('/admin/vehicles')} />
      </div>

      {/* ── Revenue Summary ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RevenueCard label="Doanh thu hôm nay"    value={analytics?.todayRevenue}  loading={loading} />
        <RevenueCard label="Doanh thu tháng này"   value={analytics?.monthRevenue}  loading={loading} />
        <RevenueCard label="Tổng doanh thu"        value={analytics?.totalRevenue}  loading={loading} accent />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart — 2/3 width */}
        <div className="lg:col-span-2 bg-surface border border-border-color rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-text-strong">Doanh thu hệ thống</h3>
              <p className="text-xs text-text-muted mt-0.5">{timeRangeLabel}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-muted-surface p-1 rounded-lg flex text-xs font-medium">
                <button
                  onClick={() => setTimeRange('day')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${timeRange === 'day' ? 'bg-surface shadow-sm text-text-strong' : 'text-text-muted hover:text-text-strong'}`}
                >
                  Ngày
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${timeRange === 'month' ? 'bg-surface shadow-sm text-text-strong' : 'text-text-muted hover:text-text-strong'}`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${timeRange === 'year' ? 'bg-surface shadow-sm text-text-strong' : 'text-text-muted hover:text-text-strong'}`}
                >
                  Năm
                </button>
              </div>

              {analytics?.revenueGrowth != null && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-eco-green bg-eco-green-soft rounded-full px-3 py-1 ml-2">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +{analytics.revenueGrowth}%
                </span>
              )}
            </div>
          </div>
          {loading ? (
            <div className="h-52 bg-muted-surface rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v: number) => fmtShort(v)} tick={{ fontSize: 10, fill: '#8c8c8c' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                  dot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#16a34a' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Booking Donut — 1/3 width */}
        <div className="bg-surface border border-border-color rounded-2xl p-6 flex flex-col">
          <h3 className="text-base font-semibold text-text-strong mb-1">Trạng thái đơn đặt xe</h3>
          <p className="text-xs text-text-muted mb-4">Phân bố hiện tại</p>
          {loading ? (
            <div className="flex-1 min-h-[160px] bg-muted-surface rounded-xl animate-pulse" />
          ) : bookingPie.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-text-muted">Chưa có dữ liệu</div>
          ) : (
            <div className="flex-1 flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={bookingPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bookingPie.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} đơn`]} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="w-full space-y-1.5 mt-2">
                {bookingPie.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-xs text-text-base">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-text-strong">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Summary totals + System status + Quick Actions ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary totals */}
        <div className="bg-surface border border-border-color rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-text-strong">Thống kê tổng</h3>
          {[
            { icon: 'group',            label: 'Tổng người dùng',    value: analytics?.totalUsers,    to: '/admin/users'    },
            { icon: 'electric_scooter', label: 'Tổng phương tiện',   value: analytics?.totalVehicles, to: '/admin/vehicles' },
            { icon: 'receipt_long',     label: 'Tổng đơn đặt xe',   value: analytics?.totalBookings, to: '/admin/bookings' },
          ].map(({ icon, label, value, to }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-border-color last:border-0 cursor-pointer hover:bg-muted-surface rounded-lg px-2 -mx-2 transition-colors"
              onClick={() => navigate(to)}
            >
              <div className="flex items-center gap-2 text-sm text-text-base">
                <span className="material-symbols-outlined text-[16px] text-text-muted">{icon}</span>
                {label}
              </div>
              {loading ? (
                <div className="h-5 w-10 bg-muted-surface rounded animate-pulse" />
              ) : (
                <span className="text-sm font-bold text-text-strong">{value ?? '—'}</span>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface border border-border-color rounded-2xl p-6">
          <h3 className="text-base font-semibold text-text-strong mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(({ icon, label, to }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border-color hover:border-eco-green hover:bg-eco-green-soft transition-all text-xs font-medium text-text-base hover:text-eco-green group"
              >
                <span className="material-symbols-outlined text-[22px] text-text-muted group-hover:text-eco-green transition-colors">{icon}</span>
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-surface border border-border-color rounded-2xl p-6 flex flex-col">
          <h3 className="text-base font-semibold text-text-strong mb-4">Trạng thái hệ thống</h3>
          <div className="space-y-3 flex-1">
            {[
              { name: 'API Server',       status: 'online' },
              { name: 'Payment Gateway',  status: 'online' },
              { name: 'Database',         status: 'online' },
              { name: 'Email Service',    status: 'online' },
            ].map(({ name, status }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-text-base">{name}</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  status === 'online'
                    ? 'bg-eco-green-soft text-eco-green'
                    : 'bg-red-50 text-red-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-eco-green animate-pulse' : 'bg-red-500'}`} />
                  {status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border-color">
            <p className="text-xs text-text-muted">Cập nhật lần cuối</p>
            <p className="text-xs font-medium text-text-strong mt-0.5">
              {new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
