'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/guards/AuthGuard';
import { AddressForm } from '@/components/forms/AddressForm';
import { CheckoutForm } from '@/components/forms/CheckoutForm';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { OrderService } from '@/services/order.service';
import { CreateOrderRequest, PaymentMethod, PaymentStatus } from '@/models/order.model';
import { AlertCircle, CheckCircle, MapPin, ShoppingBag } from 'lucide-react';

const paymentMethodOptions: { value: string; label: string }[] = [
  { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito' },
  { value: 'DEBIT_CARD', label: 'Tarjeta de Débito' },
  { value: 'NET_BANKING', label: 'Transferencia Bancaria' },
  { value: 'UPI', label: 'UPI' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'GOOGLE_PAY', label: 'Google Pay' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const [addressData, setAddressData] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    mobile: '',
  });

  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [checkoutData, setCheckoutData] = useState({
    paymentMethod: 'CREDIT_CARD' as PaymentMethod,
    cardholderName: '',
    cardNumber: '',
  });

  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>({});

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
    if (addressErrors[name]) {
      setAddressErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCheckoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCheckoutData((prev) => ({ ...prev, [name]: value }));
    if (checkoutErrors[name]) {
      setCheckoutErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateAddress = (): boolean => {
    const errors: Record<string, string> = {};
    if (!addressData.firstName.trim()) errors.firstName = 'El nombre es obligatorio';
    if (!addressData.lastName.trim()) errors.lastName = 'El apellido es obligatorio';
    if (!addressData.streetAddress.trim()) errors.streetAddress = 'La dirección es obligatoria';
    if (!addressData.city.trim()) errors.city = 'La ciudad es obligatoria';
    if (!addressData.state.trim()) errors.state = 'Selecciona un departamento';
    if (!addressData.zipCode.trim()) errors.zipCode = 'El código postal es obligatorio';
    if (!addressData.mobile.trim()) errors.mobile = 'El teléfono es obligatorio';
    else if (addressData.mobile.length < 7) errors.mobile = 'Teléfono inválido';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCheckout = (): boolean => {
    const errors: Record<string, string> = {};
    if (!checkoutData.paymentMethod) errors.paymentMethod = 'Selecciona un método de pago';
    if (['CREDIT_CARD', 'DEBIT_CARD'].includes(checkoutData.paymentMethod)) {
      if (!checkoutData.cardholderName.trim()) errors.cardholderName = 'El titular es obligatorio';
      const rawCard = checkoutData.cardNumber.replace(/\s/g, '');
      if (!rawCard) errors.cardNumber = 'El número de tarjeta es obligatorio';
      else if (rawCard.length !== 16) errors.cardNumber = 'Debe tener 16 dígitos';
    }
    setCheckoutErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateAddress() || !validateCheckout()) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload: CreateOrderRequest = {
        ...addressData,
        paymentMethod: checkoutData.paymentMethod,
        status: 'PENDING' as PaymentStatus,
        paymentId: `pay-${Date.now()}`,
        cardholderName: checkoutData.cardholderName,
        cardNumber: checkoutData.cardNumber.replace(/\s/g, ''),
      };

      const order = await OrderService.create(payload);
      setCreatedOrderId(order.id);
      setStep(3);
      setOrderCompleted(true);
      refreshCart();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Error al procesar la orden');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateAddress()) setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  if (!orderCompleted && (!cart || cart.cartItems.length === 0)) {
    return (
      <AuthGuard>
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="bg-surface rounded-2xl border-2 border-dashed border-border p-12">
            <ShoppingBag size={48} className="mx-auto text-foreground-muted mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
            <p className="text-foreground-muted mb-6">
              Agrega productos antes de proceder al checkout.
            </p>
            <Button onClick={() => router.push('/products')}>Ver productos</Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Finalizar Compra</h1>
        <p className="text-foreground-muted mb-8">Completa los datos para confirmar tu orden</p>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 1 ? 'text-accent' : 'text-foreground-muted'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-accent text-white' : 'bg-background-alt text-foreground-muted'}`}>
              {step > 1 ? <CheckCircle size={16} /> : '1'}
            </div>
            <span className="hidden sm:inline">Dirección</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 2 ? 'text-accent' : 'text-foreground-muted'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-accent text-white' : 'bg-background-alt text-foreground-muted'}`}>
              {step > 2 ? <CheckCircle size={16} /> : '2'}
            </div>
            <span className="hidden sm:inline">Pago</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 text-sm font-semibold ${step >= 3 ? 'text-accent' : 'text-foreground-muted'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-accent text-white' : 'bg-background-alt text-foreground-muted'}`}>
              3
            </div>
            <span className="hidden sm:inline">Confirmación</span>
          </div>
        </div>

        {submitError && (
          <div className="bg-surface-red border border-border-red rounded-xl p-4 text-text-on-red text-sm mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error al confirmar la orden</p>
              <p className="mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-surface border border-border rounded-2xl shadow-lg p-6 md:p-8 animate-slideUp">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-accent" />
              <h2 className="text-lg font-bold text-foreground">Información de Envío</h2>
            </div>
            <AddressForm
              formData={addressData}
              onChange={handleAddressChange}
              errors={addressErrors}
            />
            <div className="flex justify-end mt-6">
              <Button size="lg" onClick={handleNext}>
                Continuar al Pago
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-surface border border-border rounded-2xl shadow-lg p-6 md:p-8 animate-slideUp">
            <CheckoutForm
              formData={checkoutData}
              onChange={handleCheckoutChange}
              errors={checkoutErrors}
              options={paymentMethodOptions}
            />
            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={handleBack}>
                Volver
              </Button>
              <Button size="lg" loading={submitting} onClick={handleConfirm}>
                Confirmar Orden
              </Button>
            </div>
          </div>
        )}

        {step === 3 && createdOrderId && (
          <div className="bg-surface border border-border rounded-2xl shadow-lg p-8 md:p-12 text-center animate-scaleIn">
            <div className="w-16 h-16 bg-surface-green rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              ¡Orden confirmada!
            </h2>
            <p className="text-foreground-muted mb-6">
              Tu orden <span className="font-semibold text-foreground">#{createdOrderId}</span> ha sido registrada exitosamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="secondary" onClick={() => router.push('/products')}>
                Seguir comprando
              </Button>
              <Button onClick={() => router.push('/orders')}>
                Ver mis órdenes
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
