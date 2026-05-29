import { SelectHTMLAttributes } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select = ({
  id,
  name,
  label,
  options,
  placeholder,
  error,
  className = '',
  ...props
}: SelectProps) => {
  const selectId = id ?? name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        className={`w-full rounded-lg border border-border bg-background-alt px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60 ${error ? 'border-error focus:border-error focus:ring-error/20' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
};