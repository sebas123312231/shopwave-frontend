'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/guards/AuthGuard';
import { OrderService } from '@/services/order.service';
import { Order } from '@/models/order.model';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, ArrowLeft, Package, Truck } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        const data = await OrderService.getById(orderId);
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
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-surface-red border border-border-red rounded-xl p-4 text-text-on-red text-sm mb-4 flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">No se pudo cargar la orden</p>
              <p className="mt-1">{error || 'No se encontró la orden especificada.'}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-medium text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al historial
          </button>
        </div>
      </AuthGuard>
    );
  }

  const orderDate = new Date(order.orderDate).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const customerName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim();

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-screen space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <button
              onClick={() => router.push('/orders')}
              className="inline-flex items-center gap-1 text-sm font-medium text-foreground-muted hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver a Mis Órdenes
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Orden #{order.id}
            </h1>
            <p className="text-sm text-foreground-muted mt-1">Realizada el {orderDate}</p>
          </div>
          <div className="sm:text-right">
            <span className="block text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1">
              Estado
            </span>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Package size={20} className="text-accent" />
                <h2 className="text-lg font-bold text-foreground">Productos</h2>
              </div>
              <div className="divide-y divide-border">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    {item.product?.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded-xl border border-border flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">
                          {item.product?.title || 'Producto'}
                        </h3>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Talla: {item.size} | Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right mt-1 sm:mt-0">
                        <p className="font-bold text-sm text-foreground">
                          {new Intl.NumberFormat('es-BO', {
                            style: 'currency',
                            currency: 'BOB',
                          }).format(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          U:{' '}
                          {new Intl.NumberFormat('es-BO', {
                            style: 'currency',
                            currency: 'BOB',
                          }).format(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-lg space-y-4 sticky top-6">
              <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
                Resumen
              </h2>
              <div className="space-y-2 text-sm text-foreground-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">
                    {new Intl.NumberFormat('es-BO', {
                      style: 'currency',
                      currency: 'BOB',
                    }).format(order.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="text-success font-medium">Gratis</span>
                </div>
                {order.discounte > 0 && (
                  <div className="flex justify-between text-error font-medium">
                    <span>Descuento</span>
                    <span>
                      -{' '}
                      {new Intl.NumberFormat('es-BO', {
                        style: 'currency',
                        currency: 'BOB',
                      }).format(order.discounte)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-2 mt-2 flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat('es-BO', {
                      style: 'currency',
                      currency: 'BOB',
                    }).format(order.totalDiscountedPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={18} className="text-accent" />
                <h2 className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                  Dirección de Entrega
                </h2>
              </div>
              <p className="text-sm font-semibold text-foreground">{customerName}</p>
              <p className="text-sm text-foreground-muted">
                {order.shippingAddress?.streetAddress || 'No especificada'}
              </p>
              <p className="text-sm text-foreground-muted">
                {order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''}
              </p>
              <p className="text-sm text-foreground-muted">
                Tel: {order.shippingAddress?.mobile || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
