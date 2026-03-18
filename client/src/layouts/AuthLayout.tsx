import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
