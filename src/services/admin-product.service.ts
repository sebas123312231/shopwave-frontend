import { api } from './api.service';
import { Product, CreateProductRequest } from '@/models/product.model';
import { ApiResponse } from '@/types/api-response.type';

export const AdminProductService = {
  getAll: async (): Promise<Product[]> => {
    return api.get<Product[]>('/products', false);
  },

  getById: async (productId: number): Promise<Product> => {
    return api.get<Product>(`/products/${productId}`, false);
  },

  create: async (req: CreateProductRequest): Promise<Product> => {
    return api.post<Product>('/admin/products/', req, true);
  },

  update: async (productId: number, req: Partial<Product>): Promise<Product> => {
    return api.put<Product>(`/admin/products/${productId}/update`, req, true);
  },

  delete: async (productId: number): Promise<ApiResponse<void>> => {
    return api.del<ApiResponse<void>>(`/admin/products/${productId}/delete`, true);
  },

  createMultiple: async (reqs: CreateProductRequest[]): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>('/admin/products/creates', reqs, true);
  },
};
