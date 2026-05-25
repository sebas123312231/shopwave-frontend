import { api } from './api.service';
import { Order, CreateOrderRequest } from '@/models/order.model';

export const OrderService = {
  create: async (req: CreateOrderRequest): Promise<Order> => {
    return api.post<Order>('/orders', req, true);
  },

  getUserOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>('/orders/user', true);
  },

  getById: async (orderId: number): Promise<Order> => {
    return api.get<Order>(`/orders/${orderId}`, true);
  },
};