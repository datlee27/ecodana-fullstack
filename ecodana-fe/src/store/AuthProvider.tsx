import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/authApi';
import type { LoginRequest } from '../types/auth';
import type { UserProfile } from '../types/user';
import { authStorage } from '../utils/storage';
import { AuthContext, type AuthContextValue } from './auth-context';

const initialToken = authStorage.getToken();
const initialUser = authStorage.getUser();

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<UserProfile | null>(initialUser);

  const login = useCallback(async (payload: LoginRequest) => {
    const authPayload = await loginApi(payload);
    authStorage.setToken(authPayload.accessToken);
    authStorage.setUser(authPayload.user);
    setToken(authPayload.accessToken);
    setUser(authPayload.user);
  }, []);

  const setCurrentUser = useCallback((nextUser: UserProfile) => {
    authStorage.setUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Backend logout may fail if token is already invalid. Always clear local state.
    } finally {
      authStorage.clear();
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
      setCurrentUser,
    }),
    [token, user, login, logout, setCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
