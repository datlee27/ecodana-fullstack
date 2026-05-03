import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import OwnerLayout from '../layouts/OwnerLayout';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/main/HomePage';
import VehicleDetailPage from '../pages/main/VehicleDetailPage';
import VehicleListPage from '../pages/main/VehicleListPage';
import AdminDashboardPage from '../pages/role/admin/AdminDashboardPage';
import AdminBookingsPage from '../pages/role/admin/AdminBookingsPage';
import AdminContractsPage from '../pages/role/admin/AdminContractsPage';
import AdminDiscountsPage from '../pages/role/admin/AdminDiscountsPage';
import AdminPaymentsPage from '../pages/role/admin/AdminPaymentsPage';
import AdminRefundsPage from '../pages/role/admin/AdminRefundsPage';
import AdminUsersPage from '../pages/role/admin/AdminUsersPage';
import AdminVehiclesPage from '../pages/role/admin/AdminVehiclesPage';
import OwnerBankAccountsPage from '../pages/role/owner/OwnerBankAccountsPage';
import OwnerBookingPage from '../pages/role/owner/OwnerBookingPage';
import BookingCheckoutPage from '../pages/role/customer/BookingCheckoutPage';
import BookingConfirmationPage from '../pages/role/customer/BookingConfirmationPage';
import BookingPaymentPage from '../pages/role/customer/BookingPaymentPage';
import FavoritesPage from '../pages/role/customer/FavoritesPage';
import MyBookingsPage from '../pages/role/customer/MyBookingsPage';
import PaymentReturnPage from '../pages/role/customer/PaymentReturnPage';
import OwnerDashboardPage from '../pages/role/owner/OwnerDashboardPage';
import OwnerFeedbackPage from '../pages/role/owner/OwnerFeedbackPage';
import OwnerPaymentPage from '../pages/role/owner/OwnerPaymentPage';
import OwnerVehicleListPage from '../pages/role/owner/OwnerVehicleListPage';
import StaffBookingsPage from '../pages/role/staff/StaffBookingsPage';
import StaffOperationsPage from '../pages/role/staff/StaffOperationsPage';
import StaffDashboardPage from '../pages/role/staff/StaffDashboardPage';
import StaffVehicleApprovalsPage from '../pages/role/staff/StaffVehicleApprovalsPage';
import BecomeOwnerPage from '../pages/shared/BecomeOwnerPage';
import ComingSoonPage from '../pages/shared/ComingSoonPage';
import LoginPage from '../pages/shared/LoginPage';
import OAuthCallbackPage from '../pages/shared/OAuthCallbackPage';
import ProfilePage from '../pages/shared/ProfilePage';
import RegisterPage from '../pages/shared/RegisterPage';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public / customer routes (with shared Header + Footer) ── */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="auth/callback" element={<OAuthCallbackPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="register-car-info" element={<BecomeOwnerPage />} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="vehicles" element={<VehicleListPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />

          <Route path="booking/checkout" element={<ProtectedRoute><BookingCheckoutPage /></ProtectedRoute>} />
          <Route path="booking/payment/:bookingId" element={<ProtectedRoute><BookingPaymentPage /></ProtectedRoute>} />
          <Route path="payment/payos-return" element={<ProtectedRoute><PaymentReturnPage /></ProtectedRoute>} />
          <Route path="booking/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="booking/confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
          <Route path="favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

          <Route
            path="owner"
            element={
              <ProtectedRoute allowedRoles={['owner', 'staff', 'admin']}>
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="vehicles" element={<OwnerVehicleListPage />} />
            <Route path="bookings" element={<OwnerBookingPage />} />
            <Route path="payments" element={<OwnerPaymentPage />} />
            <Route path="feedback" element={<OwnerFeedbackPage />} />
            <Route path="bank-accounts" element={<OwnerBankAccountsPage />} />
          </Route>

          <Route path="*" element={<ComingSoonPage title="Not Found" description="Trang ban yeu cau khong ton tai." />} />
        </Route>

        {/* ── Admin routes — standalone shell, no MainLayout ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout scope="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="vehicles" element={<AdminVehiclesPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="refunds" element={<AdminRefundsPage />} />
          <Route path="contracts" element={<AdminContractsPage />} />
          <Route path="discounts" element={<AdminDiscountsPage />} />
        </Route>

        {/* ── Staff routes — standalone shell, no MainLayout ── */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <AdminLayout scope="staff" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffDashboardPage />} />
          <Route path="vehicle-approvals" element={<StaffVehicleApprovalsPage />} />
          <Route path="bookings" element={<StaffBookingsPage />} />
          <Route path="operations" element={<StaffOperationsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
