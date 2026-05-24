import { OrderStatus } from '@/models/order.model';

interface PropiedadesOrderStatusBadge {
  estado: OrderStatus;
}

export default function OrderStatusBadge({ estado }: PropiedadesOrderStatusBadge) {
  let claseColor = 'bg-gray-100 text-gray-800 border-gray-300';

  if (estado === 'PENDING' || estado === 'PLACED') {
    claseColor = 'bg-amber-100 text-amber-800 border-amber-300';
  } else if (estado === 'CONFIRMED' || estado === 'SHIPPED') {
    claseColor = 'bg-blue-100 text-blue-800 border-blue-300';
  } else if (estado === 'DELIVERED') {
    claseColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (estado === 'CANCELLED') {
    claseColor = 'bg-rose-100 text-rose-800 border-rose-300';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${claseColor}`}>
      {estado}
    </span>
  );
}