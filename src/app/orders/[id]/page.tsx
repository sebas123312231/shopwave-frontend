'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { AuthGuard } from '@/guards/AuthGuard';
import { OrderService } from '@/services/order.service';
import { Order, OrderStatus } from '@/models/order.model';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle } from 'lucide-react';

const POLL_INTERVAL_MS = 3000;

const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED'];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const fetchDetail = useCallback(
    async (silent = false) => {
      if (!orderId) return;
      if (!silent) setLoading(true);
      try {
        const data = await OrderService.getById(orderId);
        if (!isMountedRef.current) return;
        setOrder(data);
        setError(null);
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        if (!silent) {
          setError(err instanceof Error ? err.message : 'Error al cargar el detalle');
        }
      } finally {
        if (isMountedRef.current && !silent) {
          setLoading(false);
        }
      }
    },
    [orderId],
  );

  const isTerminal = useMemo(
    () => !!order && TERMINAL_STATUSES.includes(order.orderStatus),
    [order],
  );

  useEffect(() => {
    isMountedRef.current = true;

    const initialFetch = async () => {
      try {
        const data = await OrderService.getById(orderId);
        if (!isMountedRef.current) return;
        setOrder(data);
        setError(null);
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Error al cargar el detalle');
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };
    initialFetch();

    if (isTerminal) {
      return () => {
        isMountedRef.current = false;
      };
    }

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (!document.hidden) {
          fetchDetail(true);
        }
      }, POLL_INTERVAL_MS);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
        fetchDetail(true);
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMountedRef.current = false;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchDetail, isTerminal, orderId]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </AuthGuard>
    );
  }

  if (error || !order) {
    return (
      <AuthGuard>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="bg-surface-red border border-border-red rounded-xl p-4 text-text-on-red text-sm flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">No se pudo cargar la orden</p>
              <p className="mt-1">{error || 'No se encontró la orden especificada.'}</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <OrderDetailView order={order} backPath="/orders" backLabel="Volver a Mis Órdenes" />
    </AuthGuard>
  );
}
