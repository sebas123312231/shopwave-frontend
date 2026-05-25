import { OrderStatus } from '@/models/order.model';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config: Record<OrderStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PLACED: 'bg-surface-blue text-accent-dark border-blue-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    SHIPPED: 'bg-amber-50 text-amber-700 border-amber-200',
    DELIVERED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
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
