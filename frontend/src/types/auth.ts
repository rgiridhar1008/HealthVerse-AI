export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
}
