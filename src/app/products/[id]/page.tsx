import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProductResult } from '@/lib/server/catalog';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;
function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const product = isUuid(id) ? await getProduct(id) : null;
  return product ? { title: product.title, description: product.description.slice(0, 155), openGraph: { title: product.title, description: product.description.slice(0, 155), images: [product.imageUrl] } } : { title: 'Producto no encontrado' };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const result = await getProductResult(id);
  if (result.notFound) notFound();
  if (!result.product) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><p className="eyebrow">Catálogo no disponible</p><h1 className="mt-3 text-3xl font-semibold">No pudimos cargar este producto</h1><p className="mt-3 text-muted">Comprueba que el backend esté activo e inténtalo de nuevo.</p></div>;
  return <ProductDetailClient product={result.product} />;
}
