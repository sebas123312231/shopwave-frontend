/*
 * ================================================================
 * CartItemRow — MÓDULO EN DESARROLLO / ERRORES PENDIENTES
 * ================================================================
 * Este componente muestra una fila de producto dentro del carrito.
 * Está deshabilitado hasta que el módulo de carrito sea completado.
 *
 * TODO:
 *   - Corregir actualización de cantidad en tiempo real
 *   - Manejar confirmación de eliminación con modal (no window.confirm)
 *   - Conectar con CartContext correctamente en todos los estados
 * ================================================================
 */

'use client';

// IMPLEMENTACIÓN ORIGINAL — VER ABAJO —
// El componente real se retoma en la entrega del 100%.

export const CartItemRow = () => null;

/*
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
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm(`¿Eliminar "${item.product.title}" del carrito?`)) {
      setUpdating(true);
      try {
        await removeItem(item.id);
      } finally {
        setUpdating(false);
      }
    }
  };

  const fmt = (price: number) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(price);

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-12 items-center py-5 gap-4 animate-slideUp">
      <div className="flex items-center gap-4 w-full sm:col-span-6 min-w-0">
        <img src={item.product.imageUrl} alt={item.product.title}
          className="w-20 h-24 object-cover rounded-xl bg-background-alt flex-shrink-0 border border-border" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{item.product.title}</h3>
          <p className="text-sm text-foreground-muted mt-0.5">Talla: {item.size}</p>
        </div>
      </div>
      <div className="flex items-center justify-center w-full sm:col-span-3">
        <div className="flex items-center border border-border rounded-xl bg-background-alt overflow-hidden">
          <Button variant="ghost" size="sm" disabled={item.quantity <= 1 || updating}
            onClick={() => handleQuantityChange(item.quantity - 1)}>-</Button>
          <span className="px-3 py-1 font-medium text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
          <Button variant="ghost" size="sm" disabled={updating}
            onClick={() => handleQuantityChange(item.quantity + 1)}>+</Button>
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end sm:col-span-2">
        <span className="font-bold text-foreground">{fmt(item.discountedPrice * item.quantity)}</span>
      </div>
      <div className="flex justify-end w-full sm:col-span-1">
        <Button variant="ghost" size="sm" disabled={updating} onClick={handleRemove}
          className="text-error hover:bg-red-50"><Trash2 size={18} /></Button>
      </div>
    </div>
  );
};
*/
