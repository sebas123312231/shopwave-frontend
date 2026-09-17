import type { MetadataRoute } from 'next';
import { getCatalog } from '@/lib/server/catalog';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.APP_ORIGIN ?? 'http://localhost:3000';
  const catalog = await getCatalog({ page: '0', size: '48', sort: 'newest' });
  const entries: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: 'weekly', priority: 1 },
    { url: `${origin}/products`, changeFrequency: 'daily', priority: 0.8 },
  ];
  if (catalog) {
    entries.push(...catalog.items.map((product) => ({
      url: `${origin}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })));
  }
  return entries;
}
