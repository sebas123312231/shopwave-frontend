"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Product, Rating, Review } from '@/models/product.model';
import { ProductService } from '@/services/product.service';
import { ReviewService } from '@/services/review.service';
import { RatingService } from '@/services/rating.service';
import { Spinner } from '@/components/ui/Spinner';
import { ProductDetail } from '@/components/products/ProductDetail';
import { ProductReviews } from '@/components/products/ProductReviews';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductData = useCallback(async () => {
    if (!Number.isFinite(productId) || productId <= 0) {
      setError('El producto solicitado no es válido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [productData, reviewsData, ratingsData] = await Promise.all([
        ProductService.getProduct(productId),
        ReviewService.getByProduct(productId),
        RatingService.getByProduct(productId),
      ]);

      setProduct(productData);
      setReviews(reviewsData);
      setRatings(ratingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle del producto.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0;
    const total = ratings.reduce((accumulator, item) => accumulator + item.rating, 0);
    return total / ratings.length;
  }, [ratings]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="mb-6 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-light)]">
        Volver al catálogo
      </Link>

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="rounded-lg bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] p-4 text-[var(--color-error)]">{error}</p>
      ) : !product ? (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--color-foreground-muted)]">
          Producto no encontrado.
        </p>
      ) : (
        <div className="space-y-8">
          <ProductDetail product={product} averageRating={averageRating} ratingsCount={ratings.length} />
          <ProductReviews productId={product.id} reviews={reviews} ratings={ratings} averageRating={averageRating} onRefresh={loadProductData} />
        </div>
      )}
    </div>
  );
}