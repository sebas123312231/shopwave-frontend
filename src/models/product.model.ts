import { User } from './user.model';

export interface Category {
  id: number;
  name: string;
  parentCategory?: Category;
  level: number;
}

export interface Size {
  name: string;
  quantity: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  discountPersent: number;
  quantity: number;
  brand: string;
  color: string;
  sizes: Size[];
  imageUrl: string;
  numRatings: number;
  category: Category;
  createdAt: string;
  ratings?: Rating[];
  reviews?: Review[];
}

export interface Rating {
  id: number;
  user: User;
  product: Product;
  rating: number;
  createdAt: string;
}

export interface Review {
  id: number;
  review: string;
  user: User;
  product: Product;
  createdAt: string;
}
