'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthGuard } from '@/guards/AuthGuard';
import { OrderService } from '@/services/order.service';
import { Order } from '@/models/order.model';
import { OrderList } from '@/components/orders/OrderList';
import { Spinner } from '@/components/ui/Spinner';
import { ClipboardList, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const POLL_INTERVAL_MS = 3000;

const EmptyOrders = () => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-surface rounded-2xl border-2 border-dashed border-border max-w-md mx-auto animate-fadeIn">
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const isMountedRef = useRef(true);

  const loadOrders = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await OrderService.getUserOrders();
      if (!isMountedRef.current) return;
      setOrders(data || []);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      if (!silent) {
        setError(err instanceof Error ? err.message : 'Error al obtener las órdenes');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const initialFetch = async () => {
      try {
        const data = await OrderService.getUserOrders();
        if (!isMountedRef.current) return;
        setOrders(data || []);
        setLastUpdated(new Date());
      } catch (err: unknown) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Error al obtener las órdenes');
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };
    initialFetch();

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (!document.hidden) {
          loadOrders(true);
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
        loadOrders(true);
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMountedRef.current = false;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadOrders]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading && isMountedRef.current) {
          setError('El servidor está tardando demasiado. Por favor reintenta.');
          setLoading(false);
        }
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 min-h-screen">
        <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <ClipboardList size={28} className="text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Mis Órdenes</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            {refreshing && (
              <RefreshCw size={14} className="animate-spin" />
            )}
            {lastUpdated && !loading && (
              <span>
                Actualizado {lastUpdated.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button
              onClick={() => loadOrders(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-foreground hover:bg-background-alt transition-colors disabled:opacity-50"
              aria-label="Actualizar órdenes"
            >
              <RefreshCw size={12} />
              Actualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-surface-red border border-border-red rounded-xl p-4 text-text-on-red text-sm flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error al cargar órdenes</p>
              <p className="mt-1">{error}</p>
              <button
                onClick={() => loadOrders(false)}
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
