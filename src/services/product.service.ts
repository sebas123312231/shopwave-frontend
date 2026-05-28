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

export const ProductService = {
  getProducts: async (page = 0, size = 8): Promise<Product[]> => {
    const products = await api.get<Product[]>('/products', false);
    return products.slice(page * size, (page + 1) * size);
  },

  getFilteredProducts: async (filters: ProductFilters): Promise<Page<Product>> => {
    const allProducts = await api.get<Product[]>('/products', false);
    
    let filtered = [...allProducts];
    
    if (filters.category) {
      filtered = filtered.filter(p => 
        p.category?.name?.toLowerCase().includes(filters.category!.toLowerCase()) ||
        p.category?.parentCategory?.name?.toLowerCase().includes(filters.category!.toLowerCase()) ||
        p.category?.parentCategory?.parentCategory?.name?.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }
    
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }
    
    if (filters.minDiscount !== undefined && filters.minDiscount > 0) {
      filtered = filtered.filter(p => p.discountPersent >= filters.minDiscount!);
    }
    
    if (filters.stock !== undefined) {
      filtered = filtered.filter(p => filters.stock ? p.quantity > 0 : p.quantity === 0);
    }
    
    if (filters.colors && filters.colors.length > 0) {
      filtered = filtered.filter(p => 
        filters.colors!.some(color => p.color?.toLowerCase().includes(color.toLowerCase()))
      );
    }
    
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(p => 
        p.sizes?.some(size => filters.sizes!.includes(size.name))
      );
    }
    
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'discount':
          filtered.sort((a, b) => b.discountPersent - a.discountPersent);
          break;
      }
    }
    
    const pageNumber = filters.pageNumber ?? 0;
    const pageSize = filters.pageSize ?? 12;
    const start = pageNumber * pageSize;
    const content = filtered.slice(start, start + pageSize);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    
    return {
      content,
      totalElements: filtered.length,
      totalPages,
      size: pageSize,
      number: pageNumber,
      first: pageNumber === 0,
      last: pageNumber >= totalPages - 1,
    };
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