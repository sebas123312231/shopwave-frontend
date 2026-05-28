import { api } from './api.service';
import { Cart, CartItem, AddItemRequest } from '@/models/cart.model';

export const CartService = {
  getCart: async (): Promise<Cart> => {
    return api.get<Cart>('/cart', true);
  },

  addItem: async (req: AddItemRequest): Promise<CartItem> => {
    return api.put<CartItem>('/cart/add', req, true);
  },
};