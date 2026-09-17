import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/contracts/shopwave.schema';
import { formatPrice } from '@/lib/format';
import { ProductImage } from './ProductImage';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }: { product: Product }) {
  return <article className="group overflow-hidden rounded-2xl border border-line bg-panel transition hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(46,24,88,0.1)]">
    <Link href={`/products/${product.id}`} className="block">
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-soft"><ProductImage src={product.imageUrl} alt={product.title} /><span className="absolute left-3 top-3 rounded-full bg-panel/90 px-2.5 py-1 text-xs font-bold text-brand-strong">-{Math.round(product.discountPercent)}%</span><span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-panel/90 text-ink opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={17} /></span></div>
      <div className="space-y-2 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted">{product.brand} · {product.category.name}</p><h3 className="line-clamp-2 min-h-12 font-semibold leading-6 text-ink">{product.title}</h3><div className="flex items-baseline gap-2"><span className="text-lg font-bold text-ink">{formatPrice(product.salePriceMinor)}</span><span className="text-sm text-muted line-through">{formatPrice(product.priceMinor)}</span></div></div>
    </Link>
    <div className="px-4 pb-4"><AddToCartButton product={product} /></div>
  </article>;
}

export function ProductCardSkeleton() { return <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-panel"><div className="aspect-[4/5] bg-brand-soft/50" /><div className="space-y-3 p-4"><div className="h-3 w-1/3 rounded bg-brand-soft" /><div className="h-5 w-4/5 rounded bg-brand-soft" /><div className="h-5 w-1/2 rounded bg-brand-soft" /></div></div>; }
