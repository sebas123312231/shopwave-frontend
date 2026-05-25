'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/guards/AuthGuard';
import { OrderService } from '@/services/order.service';
import { Order } from '@/models/order.model';
import { OrderList } from '@/components/orders/OrderList';
import { Spinner } from '@/components/ui/Spinner';
import { ClipboardList, ShoppingBag, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const EmptyOrders = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 animate-fadeIn">
    <div className="h-24 w-24 rounded-2xl bg-background-alt flex items-center justify-center mb-6">
      <ClipboardList size={48} className="text-foreground-muted" />
    </div>
    <h2 className="text-xl font-bold text-foreground mb-2">Sin órdenes todavía</h2>
    <p className="text-foreground-muted text-center mb-6 max-w-md">
      Cuando realices una compra, tu historial de órdenes aparecerá aquí.
    </p>
    <Link
      href="/products"
      className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent-dark transition-all hover:shadow-lg hover:shadow-blue-500/25"
    >
      <ShoppingBag size={18} />
      Explorar productos
    </Link>
  </div>
);

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initStarted, setInitStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setInitStarted(true);
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await OrderService.getUserOrders();
        setOrders(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al obtener las órdenes');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  useEffect(() => {
    if (initStarted && loading) {
      const timer = setTimeout(() => {
        if (loading) {
          setError('El servidor está tardando demasiado. Por favor reintenta.');
          setLoading(false);
        }
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [initStarted, loading]);

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Mis Órdenes</h1>

        {loading || !initStarted ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error al cargar órdenes</p>
              <p className="mt-1">{error}</p>
              <button
                onClick={() => router.refresh()}
                className="mt-3 text-accent hover:text-accent-dark font-medium text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <OrderList orders={orders} />
        )}
      </div>
    </AuthGuard>
  );
}
