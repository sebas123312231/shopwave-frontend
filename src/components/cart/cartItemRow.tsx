'use client';

import React, { useState } from 'react';
import { CartItem } from '@/models/cart.model';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Trash2 } from 'lucide-react';

const MAX_PER_PRODUCT = 10;

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const maxQty = Math.min(MAX_PER_PRODUCT, item.product.quantity);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxQty) return;
    setUpdating(true);
    try {
      await updateItem(item.id, newQuantity, item.size);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await removeItem(item.id);
    } finally {
      setUpdating(false);
      setShowDeleteModal(false);
    }
  };

  const fmt = (price: number) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(price);

  const unitDiscountedPrice = item.quantity > 0 ? item.discountedPrice / item.quantity : item.discountedPrice;

  return (
    <>
      <div className="flex flex-col sm:grid sm:grid-cols-12 items-center py-5 gap-4 animate-slideUp">
        <div className="flex items-center gap-4 w-full sm:col-span-6 min-w-0">
          <img src={item.product.imageUrl} alt={item.product.title}
            className="w-20 h-24 object-cover rounded-xl bg-background-alt flex-shrink-0 border border-border" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{item.product.title}</h3>
            <p className="text-sm text-foreground-muted mt-0.5">Talla: {item.size}</p>
            {item.product.quantity <= 5 && (
              <p className="text-xs text-warning mt-0.5">Solo quedan {item.product.quantity}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center w-full sm:col-span-3">
          <div className="flex items-center border border-border rounded-xl bg-background-alt overflow-hidden">
            <Button variant="ghost" size="sm" disabled={item.quantity <= 1 || updating}
              onClick={() => handleQuantityChange(item.quantity - 1)}>-</Button>
            <span className="px-3 py-1 font-medium text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
            <Button variant="ghost" size="sm" disabled={updating || item.quantity >= maxQty}
              onClick={() => handleQuantityChange(item.quantity + 1)}>+</Button>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end sm:col-span-2">
          <span className="font-bold text-foreground">{fmt(item.discountedPrice)}</span>
          {unitDiscountedPrice < item.product.price && (
            <span className="text-xs text-foreground-muted line-through">{fmt(item.price)}</span>
          )}
        </div>
        <div className="flex justify-end w-full sm:col-span-1">
          <Button variant="ghost" size="sm" disabled={updating} onClick={() => setShowDeleteModal(true)}
            className="text-error hover:bg-surface-red"><Trash2 size={18} /></Button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleRemove}
        title="Eliminar producto"
        message={`¿Eliminar "${item.product.title}" (${item.size}) del carrito?`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={updating}
      />
    </>
  );
};
