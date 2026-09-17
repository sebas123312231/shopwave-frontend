'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="es"><body className="grid min-h-screen place-items-center bg-[#f8f7fb] p-6 text-[#1c1730]"><main className="max-w-md text-center"><h1 className="text-3xl font-semibold">ShopWave no está disponible</h1><p className="mt-3 text-[#716c80]">Ocurrió un error inesperado.</p><button type="button" onClick={reset} className="mt-6 rounded-xl bg-[#6941c6] px-4 py-3 font-semibold text-white">Reintentar</button></main></body></html>;
}
