'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductService } from '@/services/product.service';
import { Product } from '@/models/product.model';
import { formatPrice } from '@/utils/currency.util';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getProducts(0, 8);
        setProducts(data?.content ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] p-8 text-white">
        <h1 className="mb-4 text-4xl font-bold">Bienvenido a ShopWave Fusion</h1>
        <p className="text-lg">Tu tienda online favorita con los mejores productos</p>
        <Link href="/products" className="mt-4 inline-block rounded-md bg-white px-6 py-2 font-semibold text-[var(--color-primary)] hover:bg-gray-100">
          Ver Productos
        </Link>
      </section>

      <h2 className="mb-6 text-2xl font-bold text-[var(--color-foreground)]">Productos Destacados</h2>
      {isLoading ? (
        <p className="text-center text-[var(--color-foreground-muted)]">Cargando productos...</p>
      ) : error ? (
        <p className="text-center text-[var(--color-error)]">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center text-[var(--color-foreground-muted)]">No hay productos disponibles</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group rounded-lg bg-[var(--color-surface)] p-4 shadow-md transition hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]">
              <div className="aspect-square overflow-hidden rounded-md bg-[var(--color-background-alt)]">
                <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-2 font-semibold text-[var(--color-foreground)]">{product.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-bold text-[var(--color-accent)]">{formatPrice(product.discountedPrice)}</span>
                {product.discountPersent > 0 && (
                  <span className="text-sm text-[var(--color-foreground-muted)] line-through">{formatPrice(product.price)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}