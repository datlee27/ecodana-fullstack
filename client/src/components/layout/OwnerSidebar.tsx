import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/owner/dashboard', icon: 'fas fa-chart-pie', label: 'Overview' },
  { to: '/owner/vehicles', icon: 'fas fa-car', label: 'Car Management' },
  { to: '/owner/bookings', icon: 'fas fa-book-open', label: 'Booking Management' },
  { to: '/owner/payments', icon: 'fas fa-file-invoice-dollar', label: 'Payment Management' },
  { to: '/owner/feedback', icon: 'fas fa-comments', label: 'Feedback Management' },
  { to: '/owner/bank-accounts', icon: 'fas fa-university', label: 'Bank Accounts' },
];

export const OwnerSidebar = () => {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Owner Panel</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            <i className={`${item.icon} w-4 text-center`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
