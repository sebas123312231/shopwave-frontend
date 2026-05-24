import { Order } from '@/models/order.model';
import OrderCard from './OrderCard';

interface PropiedadesOrderList {
  ordenes: Order[];
}

export default function OrderList({ ordenes }: PropiedadesOrderList) {
  if (ordenes.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl bg-gray-50">
        <p className="text-gray-500 font-medium">No tienes ninguna orden registrada todavía.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ordenes.map((ordenIndividual) => (
        <OrderCard key={ordenIndividual.id} orden={ordenIndividual} />
      ))}
    </div>
  );
}