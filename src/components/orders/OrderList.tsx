import { Order } from '@/models/order.model';
import { OrderCard } from './OrderCard';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface OrderListProps {
  orders: Order[];
}

export function OrderList({ orders }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-surface border-2 border-dashed border-border rounded-2xl p-12 text-center animate-fadeIn">
        <ClipboardList size={40} className="mx-auto text-foreground-muted mb-3" />
        <p className="text-foreground-muted font-medium">No tienes ninguna orden registrada todavía.</p>
        <Link href="/products" className="inline-block mt-4 text-accent hover:text-accent-dark font-medium text-sm">
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
