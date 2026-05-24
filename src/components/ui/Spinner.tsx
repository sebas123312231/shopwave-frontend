interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

export const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-border border-t-accent ${sizeMap[size]} ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
};