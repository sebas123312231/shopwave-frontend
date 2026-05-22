'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Product } from '@/models/product.model';
import { ProductFilters, ProductService } from '@/services/product.service';
import { Page } from '@/types/api-response.type';

interface UseProductsOptions {
  initialFilters?: ProductFilters;
}

const defaultFilters: ProductFilters = {
  category: '',
  minPrice: undefined,
  maxPrice: undefined,
  minDiscount: 0,
  sort: '',
  stock: undefined,
  pageNumber: 0,
  pageSize: 12,
};

const paginateLocalResults = (products: Product[], pageNumber: number, pageSize: number): Page<Product> => {
  const start = pageNumber * pageSize;
  const content = products.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));

  return {
    content,
    totalElements: products.length,
    totalPages,
    size: pageSize,
    number: pageNumber,
    first: pageNumber === 0,
    last: pageNumber >= totalPages - 1,
  };
};

export const useProducts = ({ initialFilters }: UseProductsOptions = {}) => {
  const [filters, setFilters] = useState<ProductFilters>({ ...defaultFilters, ...initialFilters });
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<Page<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (searchTerm.trim()) {
        const results = await ProductService.searchProducts(searchTerm.trim());
        setData(paginateLocalResults(results, filters.pageNumber ?? 0, filters.pageSize ?? 12));
      } else {
        const response = await ProductService.getFilteredProducts(filters);
        setData(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los productos');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts, serializedFilters, searchTerm]);

  const updateFilters = (partial: Partial<ProductFilters>) => {
    setFilters((previous) => ({ ...previous, ...partial, pageNumber: partial.pageNumber ?? 0 }));
  };

  const changePage = (pageNumber: number) => {
    setFilters((previous) => ({ ...previous, pageNumber }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ ...defaultFilters, pageSize: filters.pageSize ?? 12 });
  };

  return {
    productsPage: data,
    filters,
    searchTerm,
    loading,
    error,
    setSearchTerm,
    updateFilters,
    changePage,
    resetFilters,
    refetch: fetchProducts,
  };
};
