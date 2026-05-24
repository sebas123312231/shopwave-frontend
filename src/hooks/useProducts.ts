'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/models/product.model';
import { ProductFilters, ProductService } from '@/services/product.service';
import { Page } from '@/types/api-response.type';

interface UseProductsOptions {
  initialFilters?: ProductFilters;
}

const DEBOUNCE_MS = 400;

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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<Page<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm]);

  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (debouncedSearch) {
        const results = await ProductService.searchProducts(debouncedSearch);
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
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, serializedFilters, debouncedSearch]);

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
    isSearchActive: debouncedSearch.length > 0,
    loading,
    error,
    setSearchTerm,
    updateFilters,
    changePage,
    resetFilters,
    refetch: fetchProducts,
  };
};
