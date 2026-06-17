'use client';

import { PaymentInformation } from '@/models/user.model';
import { CreditCard, Plus, Check } from 'lucide-react';

interface PaymentBookProps {
  payments: PaymentInformation[];
  selectedKey: string | null;
  onSelect: (payment: PaymentInformation) => void;
  onUseNew: () => void;
}

const labelForMethod = (method: string | undefined): string => {
  switch (method) {
    case 'CREDIT_CARD':
      return 'Tarjeta de Crédito';
    case 'DEBIT_CARD':
      return 'Tarjeta de Débito';
    case 'PAYPAL':
      return 'PayPal';
    default:
      return method ?? 'Método';
  }
};

const last4 = (cardNumber: string | undefined): string => {
  if (!cardNumber) return '••••';
  const digits = cardNumber.replace(/\D/g, '');
  return digits.slice(-4) || '••••';
};

export const PaymentBook = ({ payments, selectedKey, onSelect, onUseNew }: PaymentBookProps) => {
  if (!payments || payments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Tarjetas guardadas</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {payments.map((payment, index) => {
          const key = `${payment.cardNumber}-${payment.paymentMethod}-${index}`;
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(payment)}
              className={`relative text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-3">
                <CreditCard
                  size={18}
                  className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-accent' : 'text-foreground-muted'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {payment.cardholderName || 'Sin titular'}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    •••• •••• •••• {last4(payment.cardNumber)}
                  </p>
                  <p className="text-xs text-foreground-muted">{labelForMethod(payment.paymentMethod)}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                    <Check size={12} />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onUseNew}
          className={`flex items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm font-medium transition-all ${
            selectedKey === null
              ? 'border-accent bg-accent/5 text-accent'
              : 'border-border text-foreground-muted hover:border-accent/40 hover:text-foreground'
          }`}
        >
          <Plus size={16} />
          Usar otra tarjeta
        </button>
      </div>
    </div>
  );
};
