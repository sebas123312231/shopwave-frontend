import Link from 'next/link';
import { Order } from '@/models/order.model';
import { OrderStatusBadge } from './OrderStatusBadge';
import { ArrowRight } from 'lucide-react';
import { formatBoliviaDate } from '@/utils/datetime.util';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formattedDate = formatBoliviaDate(order.orderDate);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(price);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slideUp">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-foreground">Orden #{order.id}</span>
          <OrderStatusBadge status={order.orderStatus} />
        </div>
        <p className="text-sm text-foreground-muted">Realizada el {formattedDate}</p>
        <p className="text-sm text-foreground">
          <span className="font-medium">Artículos:</span> {order.totalItem}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3 w-full md:w-auto">
        <div className="text-right">
          <p className="text-xs text-foreground-muted uppercase tracking-wider font-semibold">
            Total Pagado
          </p>
          <p className="text-xl font-extrabold text-foreground">{formatPrice(order.totalDiscountedPrice)}</p>
        </div>
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent rounded-xl hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-blue-500/25 w-full md:w-auto text-center"
        >
          Ver Detalles
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
