import { facetsSchema, productPageSchema, productSchema } from '@/contracts/shopwave.schema';
import { backendJson } from './backend';
import type { Facets, Product, ProductPage } from '@/contracts/shopwave.schema';

export type CatalogQuery = {
  q?: string;
  categoryId?: string;
  color?: string[];
  variantLabel?: string[];
  minPriceMinor?: string;
  maxPriceMinor?: string;
  inStock?: string;
  sort?: string;
  page?: string;
  size?: string;
};

function queryString(query: CatalogQuery) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) value.forEach((item) => item && params.append(key, item));
    else if (value) params.set(key, value);
  }
  return params.toString();
}

export async function getCatalog(query: CatalogQuery = {}): Promise<ProductPage | null> {
  const { response, data } = await backendJson<unknown>(`/api/v1/products?${queryString({ size: '12', ...query })}`);
  const parsed = productPageSchema.safeParse(data);
  return response.ok && parsed.success ? parsed.data : null;
}

export async function getProduct(id: string): Promise<Product | null> {
  return (await getProductResult(id)).product;
}

export async function getProductResult(id: string): Promise<{ product: Product | null; notFound: boolean }> {
  const { response, data } = await backendJson<unknown>(`/api/v1/products/${encodeURIComponent(id)}`);
  const parsed = productSchema.safeParse(data);
  return { product: response.ok && parsed.success ? parsed.data : null, notFound: response.status === 404 };
}

export async function getFacets(): Promise<Facets | null> {
  const { response, data } = await backendJson<unknown>('/api/v1/products/facets');
  const parsed = facetsSchema.safeParse(data);
  return response.ok && parsed.success ? parsed.data : null;
}
