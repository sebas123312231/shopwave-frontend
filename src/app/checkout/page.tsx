'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { OrderService } from '@/services/order.service';
import { CreateOrderRequest, PaymentMethod, PaymentStatus } from '@/models/order.model';
import { CartSummary } from '@/components/cart/CartSummary';
import { AddressForm } from '@/components/forms/AddressForm'; // <- Subcomponente importado
import { CheckoutForm } from '@/components/forms/CheckoutForm'; // <- Subcomponente importado
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AuthGuard } from '@/guards/AuthGuard';

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const copy = { ...prev }; delete copy[name]; return copy; });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'state', 'zipCode', 'mobile'];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) newErrors[field] = 'Este campo es obligatorio';
    });

    if (['CREDIT_CARD', 'DEBIT_CARD'].includes(formData.paymentMethod)) {
      if (!formData.cardholderName) newErrors.cardholderName = 'Nombre en tarjeta obligatorio';
      if (!formData.cardNumber) newErrors.cardNumber = 'Número de tarjeta obligatorio';
      else if (formData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Debe contener los 16 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm() || !cart || cart.cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const payload: CreateOrderRequest = {
        ...formData,
        status: 'COMPLETED' as PaymentStatus,
        paymentId: 'SIM-PAY-' + Math.floor(Math.random() * 1000000),
        cardholderName: formData.cardholderName || 'N/A',
        cardNumber: formData.cardNumber ? `**** **** **** ${formData.cardNumber.slice(-4)}` : 'N/A'
      };

      const completedOrder = await OrderService.create(payload);
      await refreshCart();
      alert(`🎉 ¡Orden creada con éxito! ID: ${completedOrder.orderId || completedOrder.id}`);
      router.push('/orders');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Error al procesar la orden. Verifique el stock disponible.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading || !cart) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Spinner size="lg" />
        <p className="text-xs text-[var(--color-foreground-muted)]">Sincronizando estado de compra...</p>
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
    <AuthGuard>
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-8">Checkout</h1>

        {apiError && (
          <div className="mb-6 bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] border border-[var(--color-error)] text-[var(--color-error)] p-4 rounded-md text-sm">
            <p className="font-semibold">No se pudo procesar la transacción</p>
            <p className="mt-0.5 text-xs opacity-90">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs">
            {/* Formulario de Dirección Limpio */}
            <AddressForm formData={formData} onChange={handleFormChange} errors={errors} />
            
            {/* Formulario de Pago Limpio */}
            <CheckoutForm formData={formData} onChange={handleFormChange} errors={errors} options={paymentOptions} />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <CartSummary cart={cart} showCheckoutButton={false} />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-3 text-sm font-bold tracking-wider"
              disabled={submitting}
              loading={submitting}
            >
              Confirmar Orden
            </Button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}