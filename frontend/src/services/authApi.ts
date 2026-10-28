import api from './api';
import { LoginPayload, RegisterPayload, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', payload);
    return response.data;
  },

  verifyToken: async (): Promise<AuthResponse> => {
    const response = await api.get<{ id: number; name: string; email: string; role?: string }>('/users/profile');
    const profileData = response.data;
    return {
      accessToken: localStorage.getItem('token') || '',
      user: {
        id: String(profileData.id),
        name: profileData.name,
        email: profileData.email,
      },
    };
  }
};
