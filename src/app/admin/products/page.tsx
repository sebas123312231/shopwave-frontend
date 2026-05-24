'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const mockProducts = [
  { id: 1, title: 'Zapatillas Nike Air Max 270', brand: 'Nike', price: 129.99, stock: 45, category: 'Calzado', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' },
  { id: 2, title: 'Reloj Inteligente Series 5', brand: 'Apple', price: 299.99, stock: 28, category: 'Electrónica', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100' },
  { id: 3, title: 'Campera Impermeable TNF', brand: 'The North Face', price: 189.99, stock: 12, category: 'Indumentaria', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100' },
  { id: 4, title: 'Auriculares Sony WH-1000XM4', brand: 'Sony', price: 249.99, stock: 0, category: 'Electrónica', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d6e1?w=100' },
  { id: 5, title: 'Mochila Urban 30L', brand: 'Herschel', price: 79.99, stock: 63, category: 'Accesorios', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100' },
];

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = mockProducts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Gestión de Productos</h1>
          <p className="mt-2 text-foreground-muted">Administra el catálogo de productos de tu tienda.</p>
        </div>
        <Link href="/admin/products/create">
          <Button>
            <Plus size={18} />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-border shadow-sm mb-6">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background-alt pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-background-alt">
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Producto</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">Marca</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Precio</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Stock</th>
                <th className="text-left text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Categoría</th>
                <th className="text-right text-xs font-semibold text-foreground-muted uppercase tracking-wider px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-background-alt transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.title} className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium text-foreground">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-muted hidden md:table-cell">{product.brand}</td>
                  <td className="px-4 py-3 font-semibold text-accent">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {product.stock > 0 ? (
                      <Badge variant="success">{product.stock} unidades</Badge>
                    ) : (
                      <Badge variant="danger">Sin stock</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-muted hidden lg:table-cell">{product.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-error transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-foreground-muted">Mostrando 1-5 de 247 productos</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="secondary" size="sm">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}