'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CheckCircle, Truck, Package, XCircle, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { AdminGuard } from '@/guards/AdminGuard';
import { AdminOrderService } from '@/services/admin-order.service';
import { Order, OrderStatus } from '@/models/order.model';
import { formatPrice } from '@/utils/currency.util';

const statusOptions = [
  { label: 'Todas', value: '' },
  { label: 'Pendiente', value: 'PLACED' },
  { label: 'Confirmada', value: 'CONFIRMED' },
  { label: 'Enviada', value: 'SHIPPED' },
  { label: 'Entregada', value: 'DELIVERED' },
  { label: 'Cancelada', value: 'CANCELLED' },
];

const getStatusBadge = (status: OrderStatus) => {
  const config: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger'; icon: React.ReactNode; label: string }> = {
    PENDING: { variant: 'default', icon: <Package size={12} />, label: 'Pendiente' },
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
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; order: Order | null }>({
    isOpen: false,
    order: null,
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminOrderService.getAll();
      setOrders(data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: number, action: 'confirm' | 'ship' | 'deliver' | 'cancel') => {
    try {
      setActionLoading(orderId);
      setError(null);

      switch (action) {
        case 'confirm':
          await AdminOrderService.confirm(orderId);
          break;
        case 'ship':
          await AdminOrderService.ship(orderId);
          break;
        case 'deliver':
          await AdminOrderService.deliver(orderId);
          break;
        case 'cancel':
          await AdminOrderService.cancel(orderId);
          break;
      }

      await fetchOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Error al ${action} orden`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.order) return;

    try {
      setDeleting(true);
      await AdminOrderService.delete(deleteModal.order.id);
      setOrders((prev) => prev.filter((o) => o.id !== deleteModal.order!.id));
      setDeleteModal({ isOpen: false, order: null });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar orden');
    } finally {
      setDeleting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = (o.orderId || `#${o.id}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminGuard>
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestión de Órdenes</h1>
        <p className="mt-2 text-foreground-muted">Administra y rastrea todas las órdenes de tu tienda.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-surface border border-border shadow-sm">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar por orden o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background-alt pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="md:w-48"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground-muted">No se encontraron órdenes</p>
          </div>
        ) : (
          <>
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
                        <p className="text-sm font-semibold text-accent">{order.orderId || `#${order.id}`}</p>
                        <p className="text-xs text-foreground-muted">{order.totalItem} productos</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-muted hidden md:table-cell">{order.user?.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-foreground-muted">
                        {new Date(order.orderDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(order.orderStatus)}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{formatPrice(order.totalDiscountedPrice)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                            className="p-2 rounded-lg hover:bg-surface-blue text-text-on-blue transition-colors"
                            title="Ver detalle"
                          >
                            <Eye size={16} />
                          </button>
                          {actionLoading === order.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              {(order.orderStatus === 'PLACED' || order.orderStatus === 'PENDING') && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'confirm')}
                                  className="p-2 rounded-lg hover:bg-surface-green text-success transition-colors"
                                  title="Confirmar"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {order.orderStatus === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'ship')}
                                  className="p-2 rounded-lg hover:bg-surface-amber text-text-on-amber transition-colors"
                                  title="Enviar"
                                >
                                  <Truck size={16} />
                                </button>
                              )}
                              {order.orderStatus === 'SHIPPED' && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'deliver')}
                                  className="p-2 rounded-lg hover:bg-surface-blue text-text-on-blue transition-colors"
                                  title="Entregar"
                                >
                                  <Package size={16} />
                                </button>
                              )}
                              {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleStatusChange(order.id, 'cancel')}
                                  className="p-2 rounded-lg hover:bg-surface-red text-error transition-colors"
                                  title="Cancelar"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteModal({ isOpen: true, order })}
                                className="p-2 rounded-lg hover:bg-surface-red text-error transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-foreground-muted">Mostrando {filteredOrders.length} de {orders.length} órdenes</p>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, order: null })}
        onConfirm={handleDelete}
        title="Eliminar orden"
        message={`¿Estás seguro de que deseas eliminar la orden "${deleteModal.order?.orderId || `#${deleteModal.order?.id}`}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleting}
      />
    </div>
    </AdminGuard>
  );
}
