'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, CheckCircle, Truck, Package, XCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';

const mockOrders = [
  { id: 1, orderId: 'SW-2026-0534', customer: 'juan.perez@email.com', date: '2026-05-18', status: 'PLACED', total: 149.97, items: 3 },
  { id: 2, orderId: 'SW-2026-0533', customer: 'maria.garcia@email.com', date: '2026-05-17', status: 'CONFIRMED', total: 89.99, items: 1 },
  { id: 3, orderId: 'SW-2026-0532', customer: 'carlos.rodriguez@email.com', date: '2026-05-16', status: 'SHIPPED', total: 249.98, items: 2 },
  { id: 4, orderId: 'SW-2026-0531', customer: 'ana.lopez@email.com', date: '2026-05-15', status: 'DELIVERED', total: 179.95, items: 4 },
  { id: 5, orderId: 'SW-2026-0530', customer: 'pedro.sanchez@email.com', date: '2026-05-14', status: 'CANCELLED', total: 59.99, items: 1 },
];

const statusOptions = [
  { label: 'Todas', value: '' },
  { label: 'Pendiente', value: 'PLACED' },
  { label: 'Confirmada', value: 'CONFIRMED' },
  { label: 'Enviada', value: 'SHIPPED' },
  { label: 'Entregada', value: 'DELIVERED' },
  { label: 'Cancelada', value: 'CANCELLED' },
];

const getStatusBadge = (status: string) => {
  const config: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger'; icon: React.ReactNode; label: string }> = {
    PLACED: { variant: 'default', icon: <Package size={12} />, label: 'Pendiente' },
    CONFIRMED: { variant: 'default', icon: <CheckCircle size={12} />, label: 'Confirmada' },
    SHIPPED: { variant: 'warning', icon: <Truck size={12} />, label: 'Enviada' },
    DELIVERED: { variant: 'success', icon: <CheckCircle size={12} />, label: 'Entregada' },
    CANCELLED: { variant: 'danger', icon: <XCircle size={12} />, label: 'Cancelada' },
  };
  const c = config[status] || config.PLACED;
  return (
    <Badge variant={c.variant} className="inline-flex items-center gap-1.5">
      {c.icon}
      {c.label}
    </Badge>
  );
};

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredOrders = mockOrders.filter((o) => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestión de Órdenes</h1>
        <p className="mt-2 text-foreground-muted">Administra y rastrea todas las órdenes de tu tienda.</p>
      </div>

      <div className="rounded-2xl bg-white border border-border shadow-sm">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar por orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background-alt pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="md:w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background-alt">
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Orden</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Cliente</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Fecha</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Total</th>
                <th className="text-right text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-background-alt transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-accent">{order.orderId}</p>
                    <p className="text-xs text-foreground-muted">{order.items} productos</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-muted hidden md:table-cell">{order.customer}</td>
                  <td className="px-4 py-3 text-sm text-foreground-muted">
                    {new Date(order.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors" title="Ver detalle">
                        <Eye size={16} />
                      </button>
                      {order.status === 'PLACED' && (
                        <button className="p-2 rounded-lg hover:bg-green-50 text-success transition-colors" title="Confirmar">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors" title="Enviar">
                          <Truck size={16} />
                        </button>
                      )}
                      {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                        <button className="p-2 rounded-lg hover:bg-red-50 text-error transition-colors" title="Cancelar">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-foreground-muted">Mostrando {filteredOrders.length} de {mockOrders.length} órdenes</p>
        </div>
      </div>
    </div>
  );
}