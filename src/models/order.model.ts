import { Product } from './product.model';
import { Address, User } from './user.model';

export type OrderStatus = 'PENDING' | 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI' | 'PAYPAL' | 'GOOGLE_PAY';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface PaymentDetails {
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentId: string;
  cardholderName: string;
  cardNumber: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  size: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  userId: number;
  deliveryDate?: string;
}

export interface Order {
  id: number;
  orderId: string;
  user: User;
  orderItems: OrderItem[];
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: Address;
  paymentDetails: PaymentDetails;
  totalPrice: number;
  totalDiscountedPrice: number;
  discounte: number;
  orderStatus: OrderStatus;
  totalItem: number;
  createdAt: string;
}

export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city?: string;
  state: string;
  zipCode: string;
  mobile: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentId: string;
  cardholderName: string;
  cardNumber: string;
}