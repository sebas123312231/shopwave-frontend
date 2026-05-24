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
  );
}