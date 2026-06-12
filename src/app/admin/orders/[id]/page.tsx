'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminGuard } from '@/guards/AdminGuard';
import { AdminOrderService } from '@/services/admin-order.service';
import { Order } from '@/models/order.model';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle } from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await AdminOrderService.getById(orderId);
        setOrder(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar el detalle');
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [orderId]);

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </AdminGuard>
    );
  }

  if (error || !order) {
    return (
      <AdminGuard>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-surface-red border border-border-red rounded-xl p-4 text-text-on-red text-sm flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">No se pudo cargar la orden</p>
              <p className="mt-1">{error || 'No se encontró la orden especificada.'}</p>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <OrderDetailView order={order} backPath="/admin/orders" backLabel="Volver a Órdenes" />
    </AdminGuard>
  );
}
