'use client';

import React from 'react';
import { PaymentMethod } from '@/models/order.model';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CreditCard } from 'lucide-react';

interface CheckoutFormData {
  paymentMethod: PaymentMethod;
  cardholderName: string;
  cardNumber: string;
}

interface CheckoutFormProps {
  formData: CheckoutFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  options: { value: string; label: string }[];
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ formData, onChange, errors, options }) => {
  const showCardFields = ['CREDIT_CARD', 'DEBIT_CARD'].includes(formData.paymentMethod);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length > 16) {
      rawValue = rawValue.slice(0, 16);
    }
    const formattedValue = rawValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = formattedValue;
    onChange(e);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={20} className="text-accent" />
        <h2 className="text-lg font-bold text-foreground">Método de Pago</h2>
      </div>

      <Select
        label="Forma de Pago"
        name="paymentMethod"
        value={formData.paymentMethod}
        onChange={onChange}
        options={options}
      />

      {showCardFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-background-alt border border-border rounded-xl animate-fadeIn">
          <Input
            label="Titular de la Tarjeta"
            name="cardholderName"
            value={formData.cardholderName}
            onChange={onChange}
            error={errors.cardholderName}
            autoComplete="cc-name"
            placeholder="Nombre impreso en tarjeta"
            required
          />
          <Input
            label="Número de Tarjeta (16 dígitos)"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleCardChange}
            error={errors.cardNumber}
            autoComplete="cc-number"
            inputMode="numeric"
            maxLength={19}
            placeholder="4000 1234 5678 9010"
            type="text"
            required
          />
        </div>
      )}
    </div>
  );
};
