import type { UserProfile } from './user';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthPayload {
  tokenType: string;
  accessToken: string;
  expiresInSeconds: number;
  user: UserProfile;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
}
