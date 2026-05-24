'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface AddressFormData {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  mobile: string;
}

interface AddressFormProps {
  formData: AddressFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
}

// Opciones predefinidas para evitar errores de escritura
const BOLIVIA_DEPARTMENTS = [
  { value: 'Santa Cruz', label: 'Santa Cruz' },
  { value: 'La Paz', label: 'La Paz' },
  { value: 'Cochabamba', label: 'Cochabamba' },
  { value: 'Tarija', label: 'Tarija' },
  { value: 'Potosí', label: 'Potosí' },
  { value: 'Oruro', label: 'Oruro' },
  { value: 'Chuquisaca', label: 'Chuquisaca' },
  { value: 'Beni', label: 'Beni' },
  { value: 'Pando', label: 'Pando' }
];

export const AddressForm: React.FC<AddressFormProps> = ({ formData, onChange, errors }) => {
  
  // Interceptor: Bloquea cualquier tecla que no sea un número
  const handleNumericOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permite que el campo esté vacío (para poder borrar) o que solo contenga números
    if (value === '' || /^[0-9]+$/.test(value)) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[var(--color-foreground)] border-b border-[var(--color-border)] pb-2 mb-4">
        Información de Envío
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input 
          label="Nombre" 
          name="firstName" 
          value={formData.firstName} 
          onChange={onChange} 
          error={errors.firstName} 
          autoComplete="given-name"
          required 
        />
        <Input 
          label="Apellido" 
          name="lastName" 
          value={formData.lastName} 
          onChange={onChange} 
          error={errors.lastName} 
          autoComplete="family-name"
          required 
        />
        <div className="sm:col-span-2">
          <Input 
            label="Dirección de la Calle" 
            name="streetAddress" 
            value={formData.streetAddress} 
            onChange={onChange} 
            error={errors.streetAddress} 
            autoComplete="street-address"
            required 
          />
        </div>
        <Input 
          label="Ciudad" 
          name="city" 
          value={formData.city} 
          onChange={onChange} 
          error={errors.city} 
          autoComplete="address-level2"
          required 
        />
        <Select 
          label="Departamento / Estado" 
          name="state" 
          value={formData.state} 
          onChange={onChange} 
          error={errors.state}
          options={BOLIVIA_DEPARTMENTS}
          placeholder="Selecciona un departamento..."
          required 
        />
        <Input 
          label="Código Postal" 
          name="zipCode" 
          value={formData.zipCode} 
          onChange={handleNumericOnly} 
          error={errors.zipCode} 
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={5}
          placeholder="Ej: 00000"
          required 
        />
        <Input 
          label="Teléfono Móvil" 
          name="mobile" 
          value={formData.mobile} 
          onChange={handleNumericOnly} 
          error={errors.mobile} 
          autoComplete="tel"
          type="tel"
          inputMode="numeric"
          maxLength={8}
          placeholder="Ej: 71234567" 
          required 
        />
      </div>
    </div>
  );
};