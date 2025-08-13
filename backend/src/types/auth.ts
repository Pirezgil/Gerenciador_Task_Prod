export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  settings?: {
    dailyEnergyBudget: number;
    theme: string;
    timezone: string;
    notifications: boolean;
    sandboxEnabled: boolean;
    sandboxPassword?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  expiresIn: string;
}

export interface AuthResponseClean {
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export type SecurityEventType = 
  | 'login_success' 
  | 'login_failed' 
  | 'logout' 
  | 'password_reset' 
  | 'account_locked'
  | 'oauth_login_success'
  | 'oauth_login_failed';