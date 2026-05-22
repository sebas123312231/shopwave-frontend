'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductService } from '@/services/product.service';
import { Product } from '@/models/product.model';
import { ProductList } from '@/components/products/ProductList';

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
    <>
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[radial-gradient(circle_at_top_left,var(--color-accent-dark),transparent_35%),linear-gradient(130deg,var(--color-primary),var(--color-primary-light))] p-8 text-white md:p-12">
        <p className="mb-2 text-sm uppercase tracking-[0.22em] text-white/75">ShopWave Fusion</p>
        <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight md:text-5xl">Encuentra tu próximo producto favorito.</h1>
        <p className="max-w-xl text-white/85">Explora el catálogo completo con filtros por precio, categoría y descuento para comprar más rápido.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)]"
        >
          Ir al catálogo
        </Link>
      </section>

      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Productos destacados</h2>
        <Link href="/products" className="text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-light)]">
          Ver todos
        </Link>
      </div>

      <ProductList
        products={products}
        loading={isLoading}
        error={error || null}
        emptyMessage="No hay productos disponibles por el momento."
      />
    </div>

    <footer className="mt-8 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-[var(--color-foreground-muted)]">
        © 2026 ShopWave Fusion. Todos los derechos reservados.
      </div>
    </footer>
    </>
  );
}