import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import OwnerLayout from '../layouts/OwnerLayout';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/main/HomePage';
import VehicleDetailPage from '../pages/main/VehicleDetailPage';
import VehicleListPage from '../pages/main/VehicleListPage';
import AdminDashboardPage from '../pages/role/admin/AdminDashboardPage';
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
import StaffDashboardPage from '../pages/role/staff/StaffDashboardPage';
import ComingSoonPage from '../pages/shared/ComingSoonPage';
import LoginPage from '../pages/shared/LoginPage';
import OAuthCallbackPage from '../pages/shared/OAuthCallbackPage';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="auth/callback" element={<OAuthCallbackPage />} />
          <Route path="register" element={<ComingSoonPage title="Register" description="Form dang ky dang duoc dong bo sang React." />} />
          <Route path="register-car-info" element={<ComingSoonPage title="Become a Car Owner" description="Trang dang ky chu xe dang duoc migrate theo giao dien cu." />} />
          <Route path="profile" element={<ProtectedRoute><ComingSoonPage title="Profile" description="Trang profile dang duoc migrate theo giao dien cu." /></ProtectedRoute>} />

          <Route path="vehicles" element={<VehicleListPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />

          <Route
            path="booking/checkout"
            element={
              <ProtectedRoute>
                <BookingCheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="booking/payment/:bookingId"
            element={
              <ProtectedRoute>
                <BookingPaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="payment/payos-return"
            element={
              <ProtectedRoute>
                <PaymentReturnPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="booking/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="booking/confirmation/:bookingId"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />

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

          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><StaffDashboardPage /></ProtectedRoute>} />

          <Route path="*" element={<ComingSoonPage title="Not Found" description="Trang ban yeu cau khong ton tai." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
