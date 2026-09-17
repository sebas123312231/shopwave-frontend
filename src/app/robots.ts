import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.APP_ORIGIN ?? 'http://localhost:3000';
  return {
    rules: { userAgent: '*', allow: ['/', '/products', '/products/'], disallow: ['/api/', '/login', '/register', '/cart', '/checkout', '/orders', '/profile', '/admin'] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
