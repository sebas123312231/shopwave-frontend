import { api } from './api.service';
import { Cart, CartItem, AddItemRequest } from '@/models/cart.model';
import { CartItemService } from './cartItem.service';

export const CartService = {
  getCart: async (): Promise<Cart> => {
    return api.get<Cart>('/cart', true);
  },

  addItem: async (req: AddItemRequest): Promise<CartItem> => {
    return api.put<CartItem>('/cart/add', req, true);
  },
};