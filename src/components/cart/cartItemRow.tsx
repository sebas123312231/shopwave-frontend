'use client';

import React, { useState } from 'react';
import { CartItem } from '@/models/cart.model';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';

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
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${item.product.title} del carrito?`)) {
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

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center justify-between border-b border-[var(--color-border)] py-4 gap-4">
      {/* Detalle Producto (Columna 6) */}
      <div className="flex items-center gap-4 w-full sm:col-span-6 min-w-0">
        <img
          src={item.product.imageUrl || '/placeholder-product.png'}
          alt={item.product.title}
          className="w-20 h-24 object-cover rounded bg-[var(--color-surface)] flex-shrink-0 border border-[var(--color-border)]"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--color-foreground)] truncate">{item.product.title}</h3>
          <p className="text-sm text-[var(--color-foreground-muted)] mt-0.5">Marca: {item.product.brand}</p>
          <p className="text-sm text-[var(--color-foreground-muted)] mt-1">
            Talla: <span className="font-medium bg-[var(--color-surface-hover)] px-2 py-0.5 rounded text-xs text-[var(--color-foreground)]">{item.size}</span>
          </p>
          {/* Vista móvil del precio */}
          <div className="flex flex-col mt-1 sm:hidden">
            <span className="text-xs text-[var(--color-foreground-muted)]">
              Precio Unit: ${item.discountedPrice}
            </span>
            <span className="font-bold text-[var(--color-foreground)] mt-0.5">
              Subtotal: ${(item.discountedPrice * item.quantity)}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Cantidad (Columna 3) */}
      <div className="flex items-center justify-center w-full sm:w-auto sm:col-span-3">
        <div className="flex items-center border border-[var(--color-border)] rounded bg-[var(--color-surface)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={item.quantity <= 1 || updating}
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="px-2 py-1 min-w-[2rem]"
          >
            -
          </Button>
          <span className="px-2 py-1 font-medium text-[var(--color-foreground)] text-sm min-w-[2rem] text-center">
            {item.quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={updating}
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="px-2 py-1 min-w-[2rem]"
          >
            +
          </Button>
        </div>
      </div>

      {/* Precio Unitario y Subtotal en Desktop (Columna 2) */}
      <div className="hidden sm:flex flex-col items-end sm:col-span-2 pr-2">
        <span className="font-bold text-[var(--color-foreground)]">
          ${(item.discountedPrice * item.quantity)}
        </span>
        <span className="text-xs text-[var(--color-foreground-muted)] mt-0.5">
          ({item.quantity} x ${item.discountedPrice})
        </span>
      </div>

      {/* Botón Eliminar (Columna 1) */}
      <div className="flex justify-end w-full sm:w-auto sm:col-span-1">
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={handleRemove}
          className="w-full sm:w-auto text-center"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
};