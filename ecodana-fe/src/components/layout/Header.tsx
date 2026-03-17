import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const dashboardPath = useMemo(() => {
    const role = user?.role?.toLowerCase();
    if (role === 'admin') return '/admin';
    if (role === 'owner') return '/owner/dashboard';
    if (role === 'staff') return '/staff';
    return '/owner/dashboard';
  }, [user?.role]);

  return (
    <header id="main-nav" className="bg-white shadow-lg fixed w-full top-0 z-50 nav-font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center lg:hidden">
            <button
              id="sidebar-toggle"
              className="text-gray-600 hover:text-gray-900 mr-4"
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              <i className="fas fa-bars text-xl" />
            </button>
          </div>

          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="logo flex items-center">
              <div className="logo-icon bg-primary w-8 h-8 rounded-lg mr-2 flex items-center justify-center">
                <i className="fas fa-leaf text-white text-sm" />
              </div>
              <span className="logo-text font-bold text-xl text-primary">EcoDana</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-grow justify-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-semibold">
              Home
            </Link>
            <Link to="/vehicles" className="text-gray-700 hover:text-primary transition-colors font-semibold">
              Vehicles
            </Link>
            <Link
              to={isAuthenticated ? '/booking/my-bookings' : '/login'}
              className="text-gray-700 hover:text-primary transition-colors font-semibold"
            >
              My Bookings
            </Link>
            {isAuthenticated ? (
              <Link to="/favorites" className="text-gray-700 hover:text-primary transition-colors font-semibold">
                Favorites
              </Link>
            ) : null}
            <Link to="/register-car-info" className="text-gray-700 hover:text-primary transition-colors font-semibold">
              Become a Car Owner
            </Link>
          </div>

          <div className="flex items-center">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-primary hover:text-accent transition-colors flex items-center font-semibold">
                  <i className="fas fa-sign-in-alt mr-1" />Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors flex items-center font-semibold"
                >
                  <i className="fas fa-user-plus mr-1" />Sign Up
                </Link>
              </div>
            ) : (
              <div id="userMenu" className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors" type="button">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm" />
                    </div>
                    <span className="hidden md:inline font-semibold">{user?.firstName || user?.username || 'User'}</span>
                    <i className="fas fa-chevron-down text-xs" />
                  </button>

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.firstName || ''} {user?.lastName || ''}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link to={dashboardPath} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <i className="fas fa-tachometer-alt w-5 mr-2 text-gray-500" />
                          Dashboard
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 my-1" />

                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <i className="fas fa-user-edit w-5 mr-2 text-gray-500" />
                        My Profile
                      </Link>

                      <Link to="/booking/my-bookings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <i className="fas fa-history w-5 mr-2 text-gray-500" />
                        My Bookings
                      </Link>

                      <div className="border-t border-gray-100 my-1" />

                      <button
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        type="button"
                        onClick={() => void logout()}
                      >
                        <i className="fas fa-sign-out-alt w-5 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {mobileOpen ? (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2">
            <Link to="/" className="block text-gray-700 font-semibold" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link to="/vehicles" className="block text-gray-700 font-semibold" onClick={() => setMobileOpen(false)}>
              Vehicles
            </Link>
            <Link to="/booking/my-bookings" className="block text-gray-700 font-semibold" onClick={() => setMobileOpen(false)}>
              My Bookings
            </Link>
            <Link to="/favorites" className="block text-gray-700 font-semibold" onClick={() => setMobileOpen(false)}>
              Favorites
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
};
