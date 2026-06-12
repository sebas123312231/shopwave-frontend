import { api } from './api.service';
import { Order } from '@/models/order.model';
import { ApiResponse } from '@/types/api-response.type';

export const AdminOrderService = {
  getAll: async (): Promise<Order[]> => {
    return api.get<Order[]>('/admin/orders/', true);
  },

  getById: async (orderId: number): Promise<Order> => {
    return api.get<Order>(`/orders/${orderId}`, true);
  },

  confirm: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/confirmed`, {}, true);
  },

  ship: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/ship`, {}, true);
  },

  deliver: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/deliver`, {}, true);
  },

  cancel: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/cancel`, {}, true);
  },

  delete: async (orderId: number): Promise<ApiResponse<void>> => {
    return api.del<ApiResponse<void>>(`/admin/orders/${orderId}/delete`, true);
  },
};
