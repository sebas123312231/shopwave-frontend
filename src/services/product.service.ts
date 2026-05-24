import { api } from './api.service';
import { Product } from '@/models/product.model';
import { Page } from '@/types/api-response.type';

export interface ProductFilters {
  category?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: string;
  stock?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

const toCsv = (values?: string[]): string | undefined => {
  if (!values || values.length === 0) {
    return undefined;
  }

  return values.join(',');
};

const buildFilterQuery = (filters: ProductFilters): string => {
  const params = new URLSearchParams();

  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minDiscount !== undefined) params.set('minDiscount', String(filters.minDiscount));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.stock !== undefined) params.set('stock', String(filters.stock));

  const colors = toCsv(filters.colors);
  const sizes = toCsv(filters.sizes);

  if (colors) params.set('colors', colors);
  if (sizes) params.set('sizes', sizes);

  params.set('pageNumber', String(filters.pageNumber ?? 0));
  params.set('pageSize', String(filters.pageSize ?? 12));

  return params.toString();
};

export const ProductService = {
  getProducts: async (page = 0, size = 8): Promise<Page<Product>> => {
    return api.get<Page<Product>>(`/products?page=${page}&size=${size}`, false);
  },

  getFilteredProducts: async (filters: ProductFilters): Promise<Page<Product>> => {
    const query = buildFilterQuery(filters);
    return api.get<Page<Product>>(`/products/all?${query}`, false);
  },

  getProduct: async (id: number): Promise<Product> => {
    return api.get<Product>(`/products/${id}`, false);
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    return api.get<Product[]>(`/products/products/search?q=${encodeURIComponent(query)}`, false);
  },

  getByCategory: async (categoryName: string, page = 0, pageSize = 12): Promise<Page<Product>> => {
    return api.get<Page<Product>>(
      `/products/by-category?categoryName=${encodeURIComponent(categoryName)}&page=${page}&pageSize=${pageSize}`,
      false,
    );
  },
};