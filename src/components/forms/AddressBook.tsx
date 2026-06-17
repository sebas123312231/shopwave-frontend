'use client';

import { Address } from '@/models/user.model';
import { MapPin, Plus, Check } from 'lucide-react';

interface AddressBookProps {
  addresses: Address[];
  selectedId: number | null;
  onSelect: (address: Address) => void;
  onUseNew: () => void;
}

export const AddressBook = ({ addresses, selectedId, onSelect, onUseNew }: AddressBookProps) => {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">Direcciones guardadas</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addresses.map((address) => {
          const isSelected = selectedId === address.id;
          return (
            <button
              key={address.id}
              type="button"
              onClick={() => onSelect(address)}
              className={`relative text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                  : 'border-border bg-surface hover:border-accent/40'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-accent' : 'text-foreground-muted'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-xs text-foreground-muted truncate">{address.streetAddress}</p>
                  <p className="text-xs text-foreground-muted">
                    {address.state} — {address.zipCode}
                  </p>
                  <p className="text-xs text-foreground-muted">{address.mobile}</p>
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
            selectedId === null
              ? 'border-accent bg-accent/5 text-accent'
              : 'border-border text-foreground-muted hover:border-accent/40 hover:text-foreground'
          }`}
        >
          <Plus size={16} />
          Usar una nueva dirección
        </button>
      </div>
    </div>
  );
};
