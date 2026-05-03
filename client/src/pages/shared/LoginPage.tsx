import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginForm } from '../../features/auth/loginSchema';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { getRoleHomePath } from '../../utils/role';

const LoginPage = () => {
  const { login } = useAuth();
  const { error: notifyError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const lastOauthErrorRef = useRef<string | null>(null);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const oauthError = searchParams.get('oauthError');

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  const googleLoginUrl = `${backendBaseUrl || ''}/oauth2/authorization/google`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!oauthError || lastOauthErrorRef.current === oauthError) return;
    notifyError('Google login failed. Please try again.');
    lastOauthErrorRef.current = oauthError;
  }, [notifyError, oauthError]);

  const onSubmit = async (values: LoginForm) => {
    try {
      const loggedInUser = await login(values);
      const roleHome = getRoleHomePath(loggedInUser);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? roleHome;
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.';
      notifyError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center pt-16 px-4 pb-12">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-primary mb-2">
            <i className="fas fa-leaf mr-2" />EcoDana
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} id="loginForm">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              <i className="fas fa-user mr-1" /> Email *
            </label>
            <input
              type="text"
              {...register('usernameOrEmail')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${errors.usernameOrEmail ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Nhap email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              <i className="fas fa-lock mr-1" />Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Nhap mat khau"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <a href="#" className="text-sm text-primary hover:text-accent transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-accent transition-colors mb-4 flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <i className="fas fa-sign-in-alt mr-2" />
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            {isSubmitting ? (
              <span className="ml-2">
                <i className="fas fa-spinner fa-spin" />
              </span>
            ) : null}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href={googleLoginUrl}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="text-secondary hover:underline font-medium transition-colors">
            Register
          </Link>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
            <i className="fas fa-arrow-left mr-1" />Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
