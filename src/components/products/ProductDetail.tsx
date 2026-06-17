'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/models/product.model';
import { formatPrice } from '@/utils/currency.util';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import { Minus, Plus, ShoppingCart, XCircle, Trash2, LogIn } from 'lucide-react';

const MAX_PER_PRODUCT = 10;

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail = ({ product }: ProductDetailProps) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addItem, removeItem, cart } = useCart();
  const router = useRouter();
  const availableSizes = useMemo(
    () => product.sizes?.filter((size) => size.quantity > 0).map((size) => size.name) ?? [],
    [product.sizes],
  );

  const isOutOfStock = product.quantity <= 0;
  const maxQty = Math.min(MAX_PER_PRODUCT, product.quantity);

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] ?? '');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(false);

  const cartItem = useMemo(
    () => cart?.cartItems?.find((ci) => ci.product.id === product.id && ci.size === selectedSize),
    [cart, product.id, selectedSize],
  );
  const isInCart = !!cartItem;

  const handleAddToCart = async () => {
    if (!selectedSize || isOutOfStock) return;
    setAdding(true);
    try {
      await addItem(product.id, selectedSize, quantity, product.discountedPrice);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!cartItem) return;
    setRemoving(true);
    try {
      await removeItem(cartItem.id);
    } finally {
      setRemoving(false);
    }
  };

  const handleLoginRedirect = () => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      router.push('/login');
    }
  };

  return (
    <section className="grid gap-10 lg:grid-cols-[3fr_4fr]">
      <div className="overflow-hidden rounded-2xl shadow-2xl border border-border bg-surface relative">
        <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-error text-white text-lg font-bold px-6 py-3 rounded-xl">AGOTADO</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wider text-accent font-medium">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">{product.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {product.discountPersent > 0 && <Badge variant="danger">-{product.discountPersent}%</Badge>}
          {isOutOfStock ? (
            <Badge variant="danger">
              <XCircle size={12} /> Agotado
            </Badge>
          ) : (
            <Badge variant="success">Disponible</Badge>
          )}
          {product.category?.name && <Badge variant="default">{product.category.name}</Badge>}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-accent">{formatPrice(product.discountedPrice)}</span>
          {product.discountPersent > 0 && (
            <span className="text-lg text-foreground-muted line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        <p className="leading-relaxed text-foreground-muted">{product.description}</p>

        {availableSizes.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Tallas disponibles</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-surface text-foreground hover:border-accent/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <span>Stock disponible:</span>
          <span className={`font-semibold ${isOutOfStock ? 'text-error' : 'text-foreground'}`}>
            {product.quantity}
          </span>
        </div>

        {!authLoading && !isAuthenticated && (
          <div className="pt-4 border-t border-border">
            <Button
              size="lg"
              onClick={handleLoginRedirect}
              className="w-full sm:w-auto"
            >
              <LogIn size={20} /> Inicia sesión para comprar
            </Button>
            <p className="mt-2 text-xs text-foreground-muted">
              Necesitas una cuenta para añadir productos al carrito y completar tu pedido.
            </p>
          </div>
        )}

        {isAuthenticated && !isOutOfStock && availableSizes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-border">
            <div className={`flex items-center rounded-xl border border-border bg-background-alt overflow-hidden ${isInCart ? 'opacity-50' : ''}`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-foreground hover:bg-background-alt transition-colors"
                disabled={quantity <= 1 || isInCart}
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 font-medium text-sm min-w-[3rem] text-center text-foreground">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                className="px-3 py-2 text-foreground hover:bg-background-alt transition-colors"
                disabled={quantity >= maxQty || isInCart}
              >
                <Plus size={16} />
              </button>
            </div>

            {isInCart ? (
              <Button
                size="lg"
                variant="danger"
                onClick={handleRemoveFromCart}
                loading={removing}
                className="flex-1 sm:flex-none"
              >
                <Trash2 size={20} /> Quitar del carrito
              </Button>
            ) : (
              <Button size="lg" onClick={handleAddToCart} loading={adding} disabled={!selectedSize} className="flex-1 sm:flex-none">
                <ShoppingCart size={20} /> Agregar al carrito
              </Button>
            )}
          </div>
        )}

        {isAuthenticated && isOutOfStock && (
          <div className="pt-4 border-t border-border">
            <Button size="lg" disabled className="w-full sm:w-auto opacity-50 cursor-not-allowed">
              <XCircle size={20} /> Producto Agotado
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
