'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const mockCartItems = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    title: 'Zapatillas Nike Air Max 270',
    size: '42',
    price: 129.99,
    discountedPrice: 99.99,
    discountPercent: 23,
    quantity: 2,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    title: 'Reloj Inteligente Series 5',
    size: 'Unitalla',
    price: 299.99,
    discountedPrice: 249.99,
    discountPercent: 17,
    quantity: 1,
  },
];

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
    <div className="h-24 w-24 rounded-2xl bg-background-alt flex items-center justify-center mb-6">
      <ShoppingCart size={48} className="text-foreground-muted" />
    </div>
    <h2 className="text-xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
    <p className="text-foreground-muted text-center mb-6 max-w-md">
      Parece que aún no has agregado productos a tu carrito. Explora nuestro catálogo y encuentra productos increíbles.
    </p>
    <Link
      href="/products"
      className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-blue-500/25"
    >
      Explorar catálogo
      <ArrowRight size={18} />
    </Link>
  </div>
);

const CartItemRow = ({ item }: { item: typeof mockCartItems[0] }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  return (
    <div className="flex gap-4 rounded-2xl bg-white border border-border p-4 shadow-sm hover:shadow-md transition-shadow animate-slideUp">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-background-alt">
        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2">{item.title}</h3>
            <p className="text-sm text-foreground-muted mt-0.5">Talla: {item.size}</p>
          </div>
          <button className="text-error hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {item.discountPercent > 0 && (
              <span className="text-sm text-foreground-muted line-through">${item.price.toFixed(2)}</span>
            )}
            <span className="text-lg font-bold text-accent">${item.discountedPrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-background-alt transition-colors rounded-l-xl"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-medium text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-background-alt transition-colors rounded-r-xl"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const [items] = useState(mockCartItems);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Carrito de Compras</h1>
        <EmptyCart />
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Carrito de Compras</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
              <CartItemRow item={item} />
            </div>
          ))}
        </div>

        <div className="animate-slideUp animation-delay-200">
          <div className="sticky top-24 rounded-2xl bg-white border border-border shadow-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-foreground">Resumen del pedido</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Subtotal ({items.length} productos)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Envío</span>
                <span className="font-medium">{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-success">¡Envío gratis por compras mayores a $100!</p>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-accent">${total.toFixed(2)}</span>
              </div>
            </div>

            <Button size="lg" className="w-full">
              Proceder al checkout
              <ArrowRight size={18} />
            </Button>

            <Link
              href="/products"
              className="block text-center text-sm text-foreground-muted hover:text-accent transition-colors"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}