'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { OrderService } from '@/services/order.service';
import { CreateOrderRequest, PaymentMethod, PaymentStatus } from '@/models/order.model';
import { CartSummary } from '@/components/cart/cartSummary';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', streetAddress: '', city: '',
    state: '', zipCode: '', mobile: '',
    paymentMethod: 'CREDIT_CARD' as PaymentMethod,
    cardholderName: '', cardNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.cartItems || cart.cartItems.length === 0)) {
      router.push('/cart');
    }
  }, [cart, cartLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'state', 'zipCode', 'mobile'];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'Este campo es obligatorio';
      }
    });

    if (formData.paymentMethod === 'CREDIT_CARD' || formData.paymentMethod === 'DEBIT_CARD') {
      if (!formData.cardholderName) newErrors.cardholderName = 'Nombre en tarjeta obligatorio';
      if (!formData.cardNumber) newErrors.cardNumber = 'Número de tarjeta obligatorio';
      else if (formData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Debe contener los 16 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;
    if (!cart || cart.cartItems.length === 0) return;

    setSubmitting(true);

    try {
      const payload: CreateOrderRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        mobile: formData.mobile,
        paymentMethod: formData.paymentMethod,
        status: 'COMPLETED' as PaymentStatus,
        paymentId: 'SIM-PAY-' + Math.floor(Math.random() * 1000000),
        cardholderName: formData.cardholderName || 'N/A',
        cardNumber: formData.cardNumber ? `**** **** **** ${formData.cardNumber.slice(-4)}` : 'N/A'
      };

      const completedOrder = await OrderService.create(payload);
      await refreshCart();
      
      alert(`🎉 ¡Orden creada con éxito! ID de Orden: ${completedOrder.orderId || completedOrder.id}`);
      router.push('/orders');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la orden. Verifique el stock disponible.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading || !cart) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--color-foreground-muted)]">Verificando sesión y carrito...</p>
      </div>
    );
  }

  const paymentOptions = [
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito Simulado' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito Simulado' },
    { value: 'PAYPAL', label: 'PayPal Simulado' },
    { value: 'GOOGLE_PAY', label: 'Google Pay Simulado' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-8">Checkout</h1>

      {apiError && (
        <div className="mb-6 bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[var(--color-error)] text-[var(--color-error)] p-4 rounded-md text-sm shadow-xs">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs">
          
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4 border-b border-[var(--color-border)] pb-2">Información de Envío</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} required />
              <Input label="Apellido" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} required />
              <div className="sm:col-span-2">
                <Input label="Dirección de la Calle" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} error={errors.streetAddress} required />
              </div>
              <Input label="Ciudad" name="city" value={formData.city} onChange={handleInputChange} error={errors.city} required />
              <Input label="Estado / Provincia" name="state" value={formData.state} onChange={handleInputChange} error={errors.state} required />
              <Input label="Código Postal" name="zipCode" value={formData.zipCode} onChange={handleInputChange} error={errors.zipCode} required />
              <Input label="Teléfono Móvil" name="mobile" value={formData.mobile} onChange={handleInputChange} error={errors.mobile} placeholder="Ej: 71234567" required />
            </div>
          </div>

          <div className="pt-4">
            <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4 border-b border-[var(--color-border)] pb-2">Método de Pago Simulado</h2>
            <Select
              label="Forma de Pago"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              options={paymentOptions}
            />

            {['CREDIT_CARD', 'DEBIT_CARD'].includes(formData.paymentMethod) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-md">
                <Input label="Titular de la Tarjeta" name="cardholderName" value={formData.cardholderName} onChange={handleInputChange} error={errors.cardholderName} placeholder="Nombre completo" required />
                <Input label="Número de Tarjeta (16 dígitos)" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} error={errors.cardNumber} placeholder="4000 1234 5678 9010" type="text" required />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <CartSummary cart={cart} showCheckoutButton={false} />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full py-3"
            disabled={submitting}
            loading={submitting}
          >
            Confirmar Orden
          </Button>
        </div>
      </form>
    </div>
  );
}