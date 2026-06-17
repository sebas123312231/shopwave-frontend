'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/models/product.model';
import { ProductFilters, ProductService } from '@/services/product.service';
import { Page } from '@/types/api-response.type';

interface UseProductsOptions {
  initialFilters?: ProductFilters;
}

const DEBOUNCE_MS = 400;
const FILTER_STORAGE_KEY = 'shopwave:productFilters';

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

const PERSISTED_KEYS: Array<keyof ProductFilters> = [
  'category',
  'colors',
  'sizes',
  'minPrice',
  'maxPrice',
  'minDiscount',
  'sort',
  'stock',
  'pageSize',
];

const serializeFilters = (filters: ProductFilters): string => {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.colors && filters.colors.length > 0) params.set('colors', filters.colors.join(','));
  if (filters.sizes && filters.sizes.length > 0) params.set('sizes', filters.sizes.join(','));
  if (filters.minPrice !== undefined && filters.minPrice !== null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.minDiscount && filters.minDiscount > 0) params.set('minDiscount', String(filters.minDiscount));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.stock !== undefined) params.set('stock', String(filters.stock));
  return params.toString();
};

const deserializeFromSearch = (search: string): Partial<ProductFilters> | null => {
  if (!search) return null;
  const params = new URLSearchParams(search);
  const result: Partial<ProductFilters> = {};
  const category = params.get('category');
  if (category) result.category = category;
  const colors = params.get('colors');
  if (colors) result.colors = colors.split(',').filter(Boolean);
  const sizes = params.get('sizes');
  if (sizes) result.sizes = sizes.split(',').filter(Boolean);
  const minPrice = params.get('minPrice');
  if (minPrice !== null) {
    const n = Number(minPrice);
    if (!Number.isNaN(n)) result.minPrice = n;
  }
  const maxPrice = params.get('maxPrice');
  if (maxPrice !== null) {
    const n = Number(maxPrice);
    if (!Number.isNaN(n)) result.maxPrice = n;
  }
  const minDiscount = params.get('minDiscount');
  if (minDiscount !== null) {
    const n = Number(minDiscount);
    if (!Number.isNaN(n)) result.minDiscount = n;
  }
  const sort = params.get('sort');
  if (sort) result.sort = sort;
  const stock = params.get('stock');
  if (stock !== null) {
    result.stock = stock === 'true';
  }
  return Object.keys(result).length > 0 ? result : null;
};

const sanitizeForPersist = (filters: ProductFilters): Partial<ProductFilters> => {
  const out: Partial<ProductFilters> = {};
  for (const key of PERSISTED_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
};

const readInitialFilters = (initial?: ProductFilters): ProductFilters => {
  if (typeof window === 'undefined') return { ...defaultFilters, ...initial };

  const fromUrl = deserializeFromSearch(window.location.search);
  if (fromUrl) {
    return { ...defaultFilters, ...fromUrl, ...initial, pageNumber: 0 };
  }

  try {
    const raw = window.sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProductFilters>;
      return { ...defaultFilters, ...parsed, ...initial, pageNumber: 0 };
    }
  } catch {
    /* ignore parse errors */
  }

  return { ...defaultFilters, ...initial };
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
  const [filters, setFilters] = useState<ProductFilters>(() => readInitialFilters(initialFilters));
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const persistable = sanitizeForPersist(filters);
      if (Object.keys(persistable).length > 0) {
        window.sessionStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(persistable));
      } else {
        window.sessionStorage.removeItem(FILTER_STORAGE_KEY);
      }
    } catch {
      /* sessionStorage may be unavailable */
    }

    const queryString = serializeFilters(filters);
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    if (typeof window !== 'undefined' && `${window.location.pathname}${window.location.search}` !== newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [filters]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(FILTER_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      window.history.replaceState(null, '', window.location.pathname);
    }
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
