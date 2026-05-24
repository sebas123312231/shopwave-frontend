'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const steps = [
  { id: 1, label: 'Dirección', icon: MapPin },
  { id: 2, label: 'Pago', icon: CreditCard },
  { id: 3, label: 'Confirmación', icon: CheckCircle },
];

const paymentMethods = [
  { label: 'Tarjeta de Crédito/Débito', value: 'CREDIT_CARD' },
  { label: 'MercadoPago', value: 'MERCADO_PAGO' },
  { label: 'Transferencia Bancaria', value: 'BANK_TRANSFER' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitOrder = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setCurrentStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Finalizar Compra</h1>

      <div className="flex items-center justify-center mb-10">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? 'bg-accent text-white shadow-lg shadow-blue-500/25'
                    : 'bg-background-alt text-foreground-muted border border-border'
                }`}
              >
                <step.icon size={18} />
              </div>
              <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-accent' : 'text-foreground-muted'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {currentStep === 1 && (
        <div className="animate-fadeIn">
          <div className="rounded-2xl bg-white border border-border shadow-lg p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-foreground">Dirección de envío</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Nombre" placeholder="Juan" required />
              <Input label="Apellido" placeholder="Pérez" required />
              <div className="md:col-span-2">
                <Input label="Calle y número" placeholder="Av. Libertador 1234" required />
              </div>
              <Input label="Ciudad" placeholder="Buenos Aires" required />
              <Input label="Provincia" placeholder="CABA" required />
              <Input label="Código Postal" placeholder="C1001" required />
              <Input label="Teléfono" type="tel" placeholder="+54 11 1234 5678" required />
            </div>

            <Button size="lg" onClick={() => setCurrentStep(2)} className="w-full md:w-auto">
              Continuar
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="animate-fadeIn">
          <div className="rounded-2xl bg-white border border-border shadow-lg p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-foreground">Método de pago</h2>

            <Select
              label="Forma de pago"
              options={paymentMethods}
              placeholder="Selecciona un método"
            />

            <div className="space-y-4">
              <Input label="Nombre del titular" placeholder="Como aparece en la tarjeta" required />
              <Input label="Número de tarjeta" placeholder="1234 5678 9012 3456" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Vencimiento" placeholder="MM/YY" required />
                <Input label="CVV" placeholder="123" required />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="secondary" size="lg" onClick={() => setCurrentStep(1)}>
                Volver
              </Button>
              <Button size="lg" onClick={handleSubmitOrder} loading={isLoading} className="flex-1">
                Confirmar pedido
              </Button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-surface-blue border border-border-blue p-5">
            <div className="flex items-center gap-3">
              <Truck size={24} className="text-accent" />
              <div>
                <p className="font-semibold text-foreground">Envío estimado: 3-5 días hábiles</p>
                <p className="text-sm text-foreground-muted">Receba su pedido en la dirección indicada</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-fadeIn text-center py-12">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mb-6">
            <CheckCircle size={48} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">¡Pedido confirmado!</h2>
          <p className="text-foreground-muted mb-8 max-w-md mx-auto">
            Tu pedido ha sido recibido y está siendo procesado. Recibirás un email de confirmación con los detalles.
          </p>
          <p className="text-sm text-foreground-muted mb-8">Número de orden: <span className="font-bold text-accent">#SW-2026-0534</span></p>
          <Button size="lg" onClick={() => router.push('/orders')}>
            Ver mis órdenes
          </Button>
        </div>
      )}
    </div>
  );
}