import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantMap: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-surface-blue text-text-on-blue',
  success: 'bg-surface-green text-text-on-green',
  warning: 'bg-surface-amber text-text-on-amber',
  danger: 'bg-surface-red text-text-on-red',
};

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
};