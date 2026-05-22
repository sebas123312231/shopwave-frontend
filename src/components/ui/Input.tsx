import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, id, className = '', ...props }: InputProps) => {
  const inputId = id ?? props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] outline-none transition placeholder:text-[var(--color-foreground-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[color-mix(in_srgb,var(--color-error)_35%,transparent)]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
};
