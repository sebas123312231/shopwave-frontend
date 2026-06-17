export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  mobile: string;
  createdAt: string;
  addresses: Address[];
  paymentInformation: PaymentInformation[];
}

export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  mobile: string;
}

export interface PaymentInformation {
  cardholderName: string;
  cardNumber: string;
  paymentMethod: string;
}