import { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)]',
  secondary: 'bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90',
  ghost: 'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]',
};

const sizeMap: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-60 ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="border-white/30 border-t-white" />}
      <span>{children}</span>
    </button>
  );
};
