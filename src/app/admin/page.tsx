'use client';

import { Package, ClipboardList, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const stats = [
  { label: 'Total Productos', value: '247', icon: <Package size={24} />, trend: '+12 este mes', color: 'accent' },
  { label: 'Órdenes Totales', value: '1,849', icon: <ClipboardList size={24} />, trend: '+89 esta semana', color: 'success' },
  { label: 'Ingresos Mensuales', value: '$48,290', icon: <TrendingUp size={24} />, trend: '+18% vs mes anterior', color: 'accent' },
  { label: 'Órdenes Pendientes', value: '23', icon: <AlertCircle size={24} />, trend: 'Requieren atención', color: 'warning' },
];

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Panel de Administración</h1>
        <p className="mt-2 text-foreground-muted">Gestiona productos, órdenes y monitorea el rendimiento de tu tienda.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-white border border-border shadow-sm p-6 hover:shadow-lg transition-shadow animate-slideUp"
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white border border-border shadow-sm p-6 animate-slideUp animation-delay-200">
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

        <div className="rounded-2xl bg-white border border-border shadow-sm p-6 animate-slideUp animation-delay-300">
          <h2 className="text-lg font-bold text-foreground mb-4">Órdenes recientes</h2>
          <div className="space-y-3">
            {[
              { id: 'SW-2026-0534', status: 'Pendiente', time: 'Hace 5 min' },
              { id: 'SW-2026-0533', status: 'Confirmada', time: 'Hace 23 min' },
              { id: 'SW-2026-0532', status: 'Enviada', time: 'Hace 1 hora' },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{order.id}</p>
                  <p className="text-xs text-foreground-muted">{order.time}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  order.status === 'Pendiente' ? 'bg-amber-50 text-amber-700' :
                  order.status === 'Confirmada' ? 'bg-blue-50 text-blue-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}