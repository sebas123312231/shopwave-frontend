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
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-border bg-background-alt px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-muted focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60 ${error ? 'border-error focus:border-error focus:ring-error/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
};