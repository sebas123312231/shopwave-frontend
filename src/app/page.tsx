'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/models/product.model';
import { FeaturedMarquee } from '@/components/products/FeaturedMarquee';

const HERO_IMAGE = 'https://img.pikbest.com/ai/illus_our/20230427/6bec2b604cd4efc90ea8265ea5eafe61.jpg!bw800';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getProducts(0, 8);
        setProducts(data ?? []);
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
          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.75) 50%, rgba(60, 30, 95, 0.6) 100%), url(${HERO_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-2xl opacity-30" />

        <div className="relative z-10 px-8 md:px-16 py-12 max-w-2xl">
          <div className="animate-slideUp">
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-purple-300/80 mb-4">
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
            className="animate-slideUp text-lg text-purple-100/80 max-w-xl mb-8"
            style={{ animationDelay: '200ms' }}
          >
            Explora el catálogo completo con filtros por precio, categoría y descuento para comprar más rápido.
          </p>

          <div className="animate-slideUp" style={{ animationDelay: '300ms' }}>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
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
          <FeaturedMarquee
            products={products}
            loading={isLoading}
            error={error || null}
            emptyMessage="No hay productos disponibles por el momento."
          />
        </div>
      </section>

      <footer className="relative mt-16 overflow-hidden bg-gradient-to-br from-primary via-primary-light to-primary text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-2xl opacity-30 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 pt-16 pb-8">
          {/* Main grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                  <Sparkles size={20} className="text-accent-light" />
                </div>
                <span className="text-xl font-bold tracking-tight">ShopWave</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
                Tu tienda online de confianza. Descubre productos únicos con la mejor calidad y los mejores precios del mercado.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {['X', 'In', 'Ig', 'Gh'].map((label) => (
                  <span
                    key={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-white/50 hover:bg-accent/20 hover:text-accent-light transition-all cursor-pointer"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">Navegación</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Inicio', href: '/' },
                  { label: 'Catálogo', href: '/products' },
                  { label: 'Mi perfil', href: '/profile' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/60 hover:text-accent-light transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">Soporte</h4>
              <ul className="space-y-3">
                {['Centro de ayuda', 'Términos de uso', 'Privacidad', 'Contacto'].map((text) => (
                  <li key={text}>
                    <span className="text-sm text-white/60 hover:text-accent-light transition-colors cursor-pointer">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-white/40 mb-5">Newsletter</h4>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                Suscríbete para recibir ofertas exclusivas y novedades.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition"
                />
                <button className="flex-shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-accent/20 active:scale-95">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Divider + bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} ShopWave Fusion. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              {['Términos', 'Privacidad', 'Cookies'].map((text) => (
                <span key={text} className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}