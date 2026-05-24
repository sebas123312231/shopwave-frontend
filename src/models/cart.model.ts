import { Product } from './product.model';

export interface CartItem {
  id: number;
  product: Product;
  size: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  userId: number;
}

export interface Cart {
  id: number;
  totalPrice: number;
  totalItem: number;
  totalDiscountedPrice: number;
  discounte: number;
  cartItems: CartItem[];
}

export interface AddItemRequest {
  productId: number;
  size: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
  size: string;
}