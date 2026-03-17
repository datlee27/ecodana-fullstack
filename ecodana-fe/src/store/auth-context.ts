import { createContext } from 'react';
import type { AuthState, LoginRequest } from '../types/auth';
import type { UserProfile } from '../types/user';

export interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: (user: UserProfile) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
