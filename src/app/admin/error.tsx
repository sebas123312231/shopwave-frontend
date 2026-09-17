'use client';

import { RefreshCw } from 'lucide-react';

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="eyebrow">Admin</p><h1 className="mt-3 text-3xl font-semibold">No pudimos cargar el workspace</h1><p className="mt-3 text-muted">Revisa la conexión y vuelve a intentarlo.</p><button type="button" onClick={reset} className="button button-primary mt-7"><RefreshCw size={16} />Reintentar</button></div>;
}
