import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import BookingConfirmationPage from '../pages/BookingConfirmationPage';
import ComingSoonPage from '../pages/ComingSoonPage';
import FavoritesPage from '../pages/FavoritesPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import OwnerDashboardPage from '../pages/OwnerDashboardPage';
import VehicleDetailPage from '../pages/VehicleDetailPage';
import VehicleListPage from '../pages/VehicleListPage';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<ComingSoonPage title="Register" description="Form dang ky dang duoc dong bo sang React." />} />
          <Route path="register-car-info" element={<ComingSoonPage title="Become a Car Owner" description="Trang dang ky chu xe dang duoc migrate theo giao dien cu." />} />
          <Route path="profile" element={<ProtectedRoute><ComingSoonPage title="Profile" description="Trang profile dang duoc migrate theo giao dien cu." /></ProtectedRoute>} />

          <Route path="vehicles" element={<VehicleListPage />} />
          <Route path="vehicles/:id" element={<VehicleDetailPage />} />

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
            path="owner/dashboard"
            element={
              <ProtectedRoute>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="admin" element={<ProtectedRoute><ComingSoonPage title="Admin" description="Admin dashboard React dang duoc migrate." /></ProtectedRoute>} />
          <Route path="staff" element={<ProtectedRoute><ComingSoonPage title="Staff" description="Staff dashboard React dang duoc migrate." /></ProtectedRoute>} />

          <Route path="*" element={<ComingSoonPage title="Not Found" description="Trang ban yeu cau khong ton tai." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
