'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/guards/AuthGuard';
import { OrderService } from '@/services/order.service';
import { Order } from '@/models/order.model';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import Spinner from '@/components/ui/Spinner';

export default function PaginaDetalleOrden() {
  const parametros = useParams();
  const enrutador = useRouter();
  const identificadorOrden = Number(parametros.id);

  const [datosOrden, setDatosOrden] = useState<Order | null>(null);
  const [estaCargando, setEstaCargando] = useState<boolean>(true);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    if (!identificadorOrden) return;

    async function obtenerDetalle() {
      try {
        setEstaCargando(true);
        const respuestaOrden = await OrderService.getById(identificadorOrden);
        setDatosOrden(respuestaOrden);
      } catch (errorInesperado: unknown) {
        setMensajeError(errorInesperado instanceof Error ? errorInesperado.message : 'Error al cargar el detalle');
      } finally {
        setEstaCargando(false);
      }
    }

    obtenerDetalle();
  }, [identificadorOrden]);

  if (estaCargando) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center min-h-screen">
          <Spinner />
        </div>
      </AuthGuard>
    );
  }

  if (mensajeError || !datosOrden) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm mb-4">
            {mensajeError || 'No se encontró la orden especificada.'}
          </div>
          <button
            onClick={() => enrutador.push('/orders')}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Volver al historial
          </button>
        </div>
      </AuthGuard>
    );
  }

  const fechaOrden = new Date(datosOrden.orderDate).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const nombreClienteCompleto = `${datosOrden.shippingAddress?.firstName || ''} ${datosOrden.shippingAddress?.lastName || ''}`;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 min-h-screen space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-gray-200">
          <div>
            <button
              onClick={() => enrutador.push('/orders')}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 mb-2 block"
            >
              &larr; Volver a Mis Órdenes
            </button>
            <h1 className="text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">Orden #{datosOrden.id}</h1>
            <p className="text-sm text-gray-500 mt-1">Realizada el {fechaOrden}</p>
          </div>
          <div className="sm:text-right">
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Estado</span>
            <OrderStatusBadge estado={datosOrden.orderStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-[var(--color-background,white)] border border-gray-200 rounded-xl p-6 shadow-xs">
              <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4">Productos</h2>
              <div className="divide-y divide-gray-100">
                {datosOrden.orderItems.map((articulo) => (
                  <div key={articulo.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    {articulo.product?.imageUrl && (
                      <img
                        src={articulo.product.imageUrl}
                        alt={articulo.product.title}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--color-foreground)] text-sm">{articulo.product?.title || 'Producto'}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Talla: {articulo.size} | Cantidad: {articulo.quantity}</p>
                      </div>
                      <div className="text-right mt-1 sm:mt-0">
                        <p className="font-bold text-sm text-[var(--color-foreground)]">
                          {new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(articulo.price * articulo.quantity)}
                        </p>
                        <p className="text-xs text-gray-400">
                          U: {new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(articulo.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--color-background,white)] border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="text-md font-bold text-[var(--color-foreground)] border-b pb-2 border-gray-100">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(datosOrden.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-emerald-600 font-medium">Gratis</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-extrabold text-base text-[var(--color-foreground)]">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(datosOrden.totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-background,white)] border border-gray-200 rounded-xl p-6 shadow-xs space-y-2">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dirección de Entrega</h2>
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{nombreClienteCompleto}</p>
              <p className="text-sm text-gray-600">{datosOrden.shippingAddress?.streetAddress || 'No especificada'}</p>
              <p className="text-sm text-gray-600">{datosOrden.shippingAddress?.city || ''}, {datosOrden.shippingAddress?.state || ''}</p>
              <p className="text-sm text-gray-600">Tel: {datosOrden.shippingAddress?.mobile || 'No especificado'}</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}