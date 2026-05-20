import { api } from './api.service';
import { RegisterRequest } from '@/models/auth.model';
import { User } from '@/models/user.model';
import { setToken, removeToken } from '@/utils/token.util';

export const AuthService = {
  login: async (email: string, password: string): Promise<void> => {
    const jwt = await api.loginBasic(email, password);
    setToken(jwt);
  },

  register: async (data: RegisterRequest): Promise<User> => {
    return api.post<User>('/auth/signup', data, false);
  },

  logout: (): void => {
    removeToken();
    window.location.href = '/login';
  },
};