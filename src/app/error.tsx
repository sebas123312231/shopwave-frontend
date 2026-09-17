'use client';
import { RefreshCw } from 'lucide-react';
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="eyebrow">Algo salió mal</p><h1 className="mt-3 text-3xl font-semibold">No pudimos cargar esta vista</h1><p className="mt-3 text-muted">Inténtalo otra vez. Si el problema continúa, comprueba el estado del servicio.</p><button type="button" onClick={reset} className="button button-primary mt-7"><RefreshCw size={16} />Reintentar</button></div>; }
