'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/contracts/shopwave.schema';
import { useCart } from '@/context/CartContext';
import { getErrorMessage } from '@/lib/client/api';

export function AddToCartButton({ product, variantId }: { product: Product; variantId?: string }) {
  const { addItem, isMutating } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const selected = variantId ?? product.variants.find((variant) => variant.active && variant.stock > 0)?.id;
  const Icon = message === 'Agregado' ? Check : ShoppingBag;
  const add = async () => {
    if (!selected) { setMessage('Agotado'); return; }
    try { await addItem(selected, 1); setMessage('Agregado'); window.setTimeout(() => setMessage(null), 1800); } catch (error) { setMessage(getErrorMessage(error, 'No se pudo agregar')); }
  };
  return <div><button type="button" onClick={add} disabled={isMutating || !product.stockTotal} className="button button-primary w-full"><Icon size={16} />{message ?? (product.stockTotal ? 'Agregar al carrito' : 'Agotado')}</button>{message && message !== 'Agregado' && message !== 'Agotado' && <p className="mt-2 text-xs text-danger" role="alert">{message}</p>}</div>;
}
