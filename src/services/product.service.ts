import { api } from './api.service';
import { Product } from '@/models/product.model';
import { Page } from '@/types/api-response.type';

export const ProductService = {
  getProducts: async (page = 0, size = 8): Promise<Page<Product>> => {
    return api.get<Page<Product>>(`/products?page=${page}&size=${size}`, false);
  },

  getProduct: async (id: number): Promise<Product> => {
    return api.get<Product>(`/products/${id}`, false);
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    return api.get<Product[]>(`/products/products/search?q=${encodeURIComponent(query)}`, false);
  },
};