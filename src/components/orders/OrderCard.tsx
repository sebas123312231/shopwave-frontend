import Link from 'next/link';
import { Order } from '@/models/order.model';
import OrderStatusBadge from './OrderStatusBadge';

interface PropiedadesOrderCard {
  orden: Order;
}

export default function OrderCard({ orden }: PropiedadesOrderCard) {
  const fechaFormateada = new Date(orden.orderDate).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-[var(--color-background,white)] shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-[var(--color-foreground,#111827)]">Orden #{orden.id}</span>
          <OrderStatusBadge estado={orden.orderStatus} />
        </div>
        <p className="text-sm text-gray-500">Realizada el {fechaFormateada}</p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Artículos:</span> {orden.totalItem}
        </p>
      </div>
      <div className="flex flex-col items-end gap-3 w-full md:w-auto">
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Pagado</p>
          <p className="text-xl font-extrabold text-[var(--color-foreground,#111827)]">
            {new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(orden.totalPrice)}
          </p>
        </div>
        <Link
          href={`/orders/${orden.id}`}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto text-center"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}