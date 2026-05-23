'use client';

import React from 'react';
import { PaymentMethod } from '@/models/order.model';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

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

  // Interceptor: Crea la máscara visual para la tarjeta (ej. 4000 1234 5678 9010)
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Quitar todos los caracteres que no sean dígitos
    let rawValue = e.target.value.replace(/\D/g, '');
    
    // 2. Limitar a un máximo de 16 números reales
    if (rawValue.length > 16) {
      rawValue = rawValue.slice(0, 16);
    }
    
    // 3. Insertar un espacio cada 4 dígitos usando Expresiones Regulares
    const formattedValue = rawValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // 4. Inyectar el valor formateado de vuelta al evento y enviarlo a page.tsx
    e.target.value = formattedValue;
    onChange(e);
  };

  return (
    <div className="space-y-4 pt-4">
      <h2 className="text-lg font-bold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-2 mb-4">
        Método de Pago Simulado
      </h2>
      
      <Select
        label="Forma de Pago"
        name="paymentMethod"
        value={formData.paymentMethod}
        onChange={onChange}
        options={options}
      />

      {showCardFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-md animate-fadeIn">
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
            maxLength={19} /* 16 números + 3 espacios */
            placeholder="4000 1234 5678 9010" 
            type="text" 
            required 
          />
        </div>
      )}
    </div>
  );
};