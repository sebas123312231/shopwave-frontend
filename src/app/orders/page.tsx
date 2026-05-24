'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/guards/AuthGuard';
import { OrderService } from '@/services/order.service';
import { Order } from '@/models/order.model';
import OrderList from '@/components/orders/OrderList';
import Spinner from '@/components/ui/Spinner';

export default function PaginaHistorialOrdenes() {
  const [listaOrdenes, setListaOrdenes] = useState<Order[]>([]);
  const [estaCargando, setEstaCargando] = useState<boolean>(true);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarHistorial() {
      try {
        setEstaCargando(true);
        const datosOrdenes = await OrderService.getUserOrders();
        setListaOrdenes(datosOrdenes || []);
      } catch (errorInesperado: unknown) {
        setMensajeError(errorInesperado instanceof Error ? errorInesperado.message : 'Error al obtener las órdenes');
      } finally {
        setEstaCargando(false);
      }
    }
    cargarHistorial();
  }, []);

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-8">Mis Órdenes</h1>
        {estaCargando ? (
          <div className="flex justify-center items-center py-24">
            <Spinner />
          </div>
        ) : mensajeError ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium">
            {mensajeError}
          </div>
        ) : (
          <OrderList ordenes={listaOrdenes} />
        )}
      </div>
    </AuthGuard>
import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const mockOrders = [
  {
    id: 'SW-2026-0534',
    date: '2026-05-18',
    status: 'PLACED',
    items: 3,
    total: 149.97,
  },
  {
    id: 'SW-2026-0489',
    date: '2026-05-10',
    status: 'DELIVERED',
    items: 1,
    total: 99.99,
  },
  {
    id: 'SW-2026-0421',
    date: '2026-04-28',
    status: 'SHIPPED',
    items: 2,
    total: 249.98,
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger'; icon: React.ReactNode; label: string }> = {
    PLACED: { variant: 'default', icon: <Clock size={14} />, label: 'Pendiente' },
    CONFIRMED: { variant: 'default', icon: <CheckCircle size={14} />, label: 'Confirmado' },
    SHIPPED: { variant: 'warning', icon: <Package size={14} />, label: 'Enviado' },
    DELIVERED: { variant: 'success', icon: <CheckCircle size={14} />, label: 'Entregado' },
    CANCELLED: { variant: 'danger', icon: <XCircle size={14} />, label: 'Cancelado' },
  };

  const config = statusConfig[status] || statusConfig.PLACED;

  return (
    <Badge variant={config.variant} className="inline-flex items-center gap-1.5">
      {config.icon}
      {config.label}
    </Badge>
  );
};

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
      Explorar productos
    </Link>
  </div>
);

const OrderCard = ({ order }: { order: typeof mockOrders[0] }) => (
  <div className="rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all animate-slideUp">
    <div className="p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">{order.id}</p>
          <p className="text-sm text-foreground-muted">
            {new Date(order.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-foreground-muted">{order.items} producto{order.items > 1 ? 's' : ''}</span>
          <span className="font-bold text-lg text-foreground">${order.total.toFixed(2)}</span>
        </div>

        <Button variant="secondary" size="sm">
          Ver detalle
        </Button>
      </div>
    </div>
  </div>
);

export default function OrdersPage() {
  const [orders] = useState(mockOrders);

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Mis Órdenes</h1>
        <EmptyOrders />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Mis Órdenes</h1>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div key={order.id} style={{ animationDelay: `${index * 50}ms` }}>
            <OrderCard order={order} />
          </div>
        ))}
      </div>
    </div>
  );
}