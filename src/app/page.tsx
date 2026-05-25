'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/models/product.model';
import { ProductList } from '@/components/products/ProductList';

const HERO_IMAGE = 'https://img.pikbest.com/ai/illus_our/20230427/6bec2b604cd4efc90ea8265ea5eafe61.jpg!bw800';

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
    <div className="min-h-screen">
      <section
        className="relative overflow-hidden rounded-3xl mx-4 mt-4 md:mx-8 md:mt-8 min-h-[480px] md:min-h-[560px] flex items-center bg-primary"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(30, 58, 95, 0.6) 100%), url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-2xl opacity-30" />

        <div className="relative z-10 px-8 md:px-16 py-12 max-w-2xl">
          <div className="animate-slideUp">
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-blue-300/80 mb-4">
              <Sparkles size={16} />
              Nueva colección
            </span>
          </div>

          <h1
            className="animate-slideUp text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-4"
            style={{ animationDelay: '100ms' }}
          >
            Encuentra tu próximo producto favorito
          </h1>

          <p
            className="animate-slideUp text-lg text-blue-100/80 max-w-xl mb-8"
            style={{ animationDelay: '200ms' }}
          >
            Explora el catálogo completo con filtros por precio, categoría y descuento para comprar más rápido.
          </p>

          <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Ver catálogo
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12 mx-4 md:mx-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Productos destacados</h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-accent hover:text-accent-dark transition-colors flex items-center gap-1"
          >
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="animate-fadeIn">
          <ProductList
            products={products}
            loading={isLoading}
            error={error || null}
            emptyMessage="No hay productos disponibles por el momento."
          />
        </div>
      </section>

      <footer className="mt-16 bg-gradient-to-r from-primary to-primary-light text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center">
          <h3 className="text-xl font-bold mb-2">ShopWave Fusion</h3>
          <p className="text-sm text-white/60">© 2026 ShopWave Fusion. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}