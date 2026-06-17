'use client';

import { useState, useEffect } from 'react';
import { Package, ClipboardList, TrendingUp, AlertCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AdminGuard } from '@/guards/AdminGuard';
import { AdminProductService } from '@/services/admin-product.service';
import { AdminOrderService } from '@/services/admin-order.service';
import { Product } from '@/models/product.model';
import { Order } from '@/models/order.model';
import { formatPrice } from '@/utils/currency.util';
import { formatBoliviaShortDate } from '@/utils/datetime.util';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<Array<{ id: string; status: string; time: string }>>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        let products: Product[] = [];
        let orders: Order[] = [];

        try {
          products = await AdminProductService.getAll();
        } catch (err) {
          console.error('Error loading products:', err);
        }

        try {
          orders = await AdminOrderService.getAll();
        } catch (err) {
          console.error('Error loading orders:', err);
        }

        const pendingOrders = orders.filter(
          (o) => o.orderStatus === 'PLACED' || o.orderStatus === 'PENDING'
        ).length;

        const boliviaNow = new Date(
          new Date().toLocaleString('en-US', { timeZone: 'America/La_Paz' }),
        );
        const currentMonth = boliviaNow.getMonth();
        const currentYear = boliviaNow.getFullYear();
        const monthlyRevenue = orders
          .filter((o) => {
            const orderDate = new Date(
              new Date(o.orderDate).toLocaleString('en-US', { timeZone: 'America/La_Paz' }),
            );
            return (
              o.orderStatus !== 'CANCELLED' &&
              orderDate.getMonth() === currentMonth &&
              orderDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, o) => sum + o.totalDiscountedPrice, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders,
          monthlyRevenue,
        });

        const recent = [...orders]
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 3)
          .map((o) => ({
            id: o.orderId || `#${o.id}`,
            status: o.orderStatus,
            time: formatBoliviaShortDate(o.orderDate),
          }));
        setRecentOrders(recent);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    { label: 'Total Productos', value: stats.totalProducts.toString(), icon: <Package size={24} />, trend: 'Productos en catálogo', color: 'accent' },
    { label: 'Órdenes Totales', value: stats.totalOrders.toString(), icon: <ClipboardList size={24} />, trend: 'Todas las órdenes', color: 'success' },
    { label: 'Ingresos Mensuales', value: formatPrice(stats.monthlyRevenue), icon: <TrendingUp size={24} />, trend: 'Órdenes no canceladas este mes', color: 'accent' },
    { label: 'Órdenes Pendientes', value: stats.pendingOrders.toString(), icon: <AlertCircle size={24} />, trend: 'Requieren atención', color: 'warning' },
  ];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PLACED: 'Pendiente',
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      SHIPPED: 'Enviada',
      DELIVERED: 'Entregada',
      CANCELLED: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLACED: 'bg-surface-amber text-text-on-amber',
      PENDING: 'bg-surface-amber text-text-on-amber',
      CONFIRMED: 'bg-surface-blue text-text-on-blue',
      SHIPPED: 'bg-surface-purple text-text-on-purple',
      DELIVERED: 'bg-surface-green text-text-on-green',
      CANCELLED: 'bg-surface-red text-text-on-red',
    };
    return colors[status] || 'bg-background-alt text-foreground-muted';
  };

  return (
    <AdminGuard>
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-accent" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Panel de Administración</h1>
        </div>
        <p className="mt-2 text-foreground-muted">Gestiona productos y monitorea el rendimiento de tu tienda.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {statsCards.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-surface border border-border shadow-sm p-6 hover:shadow-lg transition-shadow animate-slideUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 bg-${stat.color}/10 text-${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-sm text-foreground-muted font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-foreground-muted mt-2">{stat.trend}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 animate-slideUp animation-delay-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Acciones rápidas</h2>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/admin/products">
                  <Button variant="secondary" className="w-full justify-start">
                    <Package size={18} />
                    Gestionar Productos
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="secondary" className="w-full justify-start">
                    <ClipboardList size={18} />
                    Ver Órdenes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 animate-slideUp animation-delay-300">
              <h2 className="text-lg font-bold text-foreground mb-4">Órdenes recientes</h2>
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{order.id}</p>
                        <p className="text-xs text-foreground-muted">{order.time}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">No hay órdenes recientes</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
    </AdminGuard>
  );
}
