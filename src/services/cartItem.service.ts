import { api } from './api.service';
import { CartItem, UpdateCartItemRequest } from '@/models/cart.model';
import { ApiResponse } from '@/types/api-response.type';

export const CartItemService = {
  update: async (cartItemId: number, req: UpdateCartItemRequest): Promise<CartItem> => {
    return api.put<CartItem>(`/cart_items/${cartItemId}`, req, true);
  },

  remove: async (cartItemId: number): Promise<ApiResponse<void>> => {
    return api.del<ApiResponse<void>>(`/cart_items/${cartItemId}`, true);
  },
};