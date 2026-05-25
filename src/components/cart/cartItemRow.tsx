'use client';

import React, { useState } from 'react';
import { CartItem } from '@/models/cart.model';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    try {
      await updateItem(item.id, newQuantity, item.size);
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${item.product.title}" del carrito?`)) {
      setUpdating(true);
      try {
        await removeItem(item.id);
      } catch (err) {
        console.error('Error al remover item:', err);
      } finally {
        setUpdating(false);
      }
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(price);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center justify-between py-5 gap-4 animate-slideUp">
      {/* Producto */}
      <div className="flex items-center gap-4 w-full sm:col-span-6 min-w-0">
        <img
          src={item.product.imageUrl || '/placeholder-product.png'}
          alt={item.product.title}
          className="w-20 h-24 object-cover rounded-xl bg-background-alt flex-shrink-0 border border-border"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{item.product.title}</h3>
          <p className="text-sm text-foreground-muted mt-0.5">Marca: {item.product.brand}</p>
          <p className="text-sm text-foreground-muted mt-1">
            Talla:{" "}
            <span className="font-medium bg-background-alt px-2.5 py-0.5 rounded-lg text-xs text-foreground border border-border">
              {item.size}
            </span>
          </p>
          {/* Vista móvil del precio */}
          <div className="flex flex-col mt-2 sm:hidden">
            <span className="text-xs text-foreground-muted">
              Precio Unit: {formatPrice(item.discountedPrice)}
            </span>
            <span className="font-bold text-foreground mt-0.5">
              Subtotal: {formatPrice(item.discountedPrice * item.quantity)}
            </span>
          </div>
        </div>
      </div>

      {/* Cantidad */}
      <div className="flex items-center justify-center w-full sm:w-auto sm:col-span-3">
        <div className="flex items-center border border-border rounded-xl bg-background-alt overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={item.quantity <= 1 || updating}
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="px-3 py-1 rounded-none"
          >
            -
          </Button>
          <span className="px-3 py-1 font-medium text-foreground text-sm min-w-[2.5rem] text-center">
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={updating}
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="px-3 py-1 rounded-none"
          >
            +
          </Button>
        </div>
      </div>

      {/* Precio Desktop */}
      <div className="hidden sm:flex flex-col items-end sm:col-span-2 pr-2">
        <span className="font-bold text-foreground">
          {formatPrice(item.discountedPrice * item.quantity)}
        </span>
        <span className="text-xs text-foreground-muted mt-0.5">
          ({item.quantity} x {formatPrice(item.discountedPrice)})
        </span>
      </div>

      {/* Eliminar */}
      <div className="flex justify-end w-full sm:w-auto sm:col-span-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={updating}
          onClick={handleRemove}
          className="text-error hover:bg-red-50"
          title="Eliminar producto"
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </div>
  );
};
