"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Product } from '@/models/product.model';
import { ProductService } from '@/services/product.service';
import { Spinner } from '@/components/ui/Spinner';
import { ProductDetail } from '@/components/products/ProductDetail';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!Number.isFinite(productId) || productId <= 0) {
        setError('El producto solicitado no es válido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const productData = await ProductService.getProduct(productId);
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle del producto.');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors mb-6"
      >
        <ChevronLeft size={18} />
        Volver al catálogo
      </Link>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-error font-medium">{error}</p>
        </div>
      ) : !product ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-white">
          <p className="text-foreground-muted">Producto no encontrado.</p>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <ProductDetail product={product} averageRating={0} ratingsCount={0} />
        </div>
      )}
    </div>
  );
}