import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authStorage } from '../../utils/storage';
import { getRoleHomePath } from '../../utils/role';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        navigate('/login?oauthError=missing_token', { replace: true });
        return;
      }

      try {
        const user = await completeOAuthLogin(token);
        navigate(getRoleHomePath(user), { replace: true });
      } catch {
        authStorage.clear();
        navigate('/login?oauthError=profile_failed', { replace: true });
      }
    };

    void run();
  }, [completeOAuthLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-lg font-semibold text-slate-700">Signing you in...</div>
        <p className="text-sm text-slate-500 mt-2">Please wait a moment.</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
