import Link from 'next/link';

export default function ProductNotFound() {
  return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="eyebrow">Producto no disponible</p><h1 className="mt-3 text-3xl font-semibold">No encontramos ese producto</h1><p className="mt-3 text-muted">Puede haber sido archivado o el enlace puede estar desactualizado.</p><Link href="/products" className="button button-primary mt-7">Volver al catálogo</Link></div>;
}
