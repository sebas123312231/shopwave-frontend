import { api } from './api.service';
import { User } from '@/models/user.model';

export const UserService = {
  getProfile: async (): Promise<User> => {
    return api.get<User>('/users/profile', true);
  },
};