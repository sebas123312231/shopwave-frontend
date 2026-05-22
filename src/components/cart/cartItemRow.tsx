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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 py-4 gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <img
          src={item.product.imageUrl || '/placeholder-product.png'}
          alt={item.product.title}
          className="w-20 h-24 object-cover rounded bg-gray-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{item.product.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Marca: {item.product.brand}</p>
          <p className="text-sm text-gray-600 mt-1">
            Talla: <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">{item.size}</span>
          </p>
          <div className="flex items-baseline gap-2 mt-2 sm:hidden">
            <span className="font-bold text-gray-900">${item.discountedPrice}</span>
            {item.price > item.discountedPrice && (
              <span className="text-xs text-gray-400 line-through">${item.price}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8">
        <div className="flex items-center border border-gray-300 rounded bg-white">
          <button
            type="button"
            disabled={item.quantity <= 1 || updating}
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
          >
            -
          </button>
          <span className="px-3 py-1 font-medium text-gray-800 text-sm min-w-[2.5rem] text-center">
            {item.quantity}
          </span>
          <button
            type="button"
            disabled={updating}
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition disabled:opacity-30"
          >
            +
          </button>
        </div>

        <div className="hidden sm:flex flex-col items-end min-w-[5rem]">
          <span className="font-bold text-gray-900">${(item.discountedPrice * item.quantity)}</span>
          {item.price > item.discountedPrice && (
            <span className="text-xs text-gray-400 line-through">${(item.price * item.quantity)}</span>
          )}
        </div>

        <Button
          variant="danger"
          size="sm"
          disabled={updating}
          onClick={handleRemove}
          className="text-xs py-1.5 px-3"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
};