import { OrderStatus } from '@/models/order.model';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config: Record<OrderStatus, string> = {
    PENDING: 'bg-surface-amber text-text-on-amber border-border-amber',
    PLACED: 'bg-surface-blue text-text-on-blue border-border-blue',
    CONFIRMED: 'bg-surface-blue text-text-on-blue border-border-blue',
    SHIPPED: 'bg-surface-amber text-text-on-amber border-border-amber',
    DELIVERED: 'bg-surface-green text-text-on-green border-border-green',
    CANCELLED: 'bg-surface-red text-text-on-red border-border-red',
  };

  const labels: Record<OrderStatus, string> = {
    PENDING: 'Pendiente',
    PLACED: 'Realizada',
    CONFIRMED: 'Confirmada',
    SHIPPED: 'Enviada',
    DELIVERED: 'Entregada',
    CANCELLED: 'Cancelada',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config[status] || config.PLACED}`}
    >
      {labels[status] || status}
    </span>
  );
}
