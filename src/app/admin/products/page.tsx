'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { AdminGuard } from '@/guards/AdminGuard';
import { AdminProductService } from '@/services/admin-product.service';
import { Product } from '@/models/product.model';
import { formatPrice } from '@/utils/currency.util';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminProductService.getAll();
      setProducts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AdminProductService.getAll();
        if (mounted) setProducts(data);
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : 'Error al cargar productos');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      setDeleting(true);
      await AdminProductService.delete(deleteModal.product.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.product!.id));
      setDeleteModal({ isOpen: false, product: null });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>

    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors mb-6"
      >
        <ChevronLeft size={18} />
        Volver al panel de administración
      </Link>

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

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-surface border border-border shadow-sm mb-6">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-border bg-background-alt pl-10 pr-4 py-2.5 text-sm outline-none transition focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground-muted">No se encontraron productos</p>
          </div>
        ) : (
          <>
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
                          <img src={product.imageUrl} alt={product.title} className="h-10 w-10 rounded-lg object-cover" />
                          <span className="font-medium text-foreground">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-muted hidden md:table-cell">{product.brand}</td>
                      <td className="px-4 py-3 font-semibold text-accent">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        {product.quantity > 0 ? (
                          <Badge variant="success">{product.quantity} unidades</Badge>
                        ) : (
                          <Badge variant="danger">Sin stock</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground-muted hidden lg:table-cell">{product.category?.name || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                            className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, product })}
                            className="p-2 rounded-lg hover:bg-surface-red text-error transition-colors"
                          >
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
              <p className="text-sm text-foreground-muted">Mostrando {filteredProducts.length} de {products.length} productos</p>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDelete}
        title="Eliminar producto"
        message={`¿Estás seguro de que deseas eliminar "${deleteModal.product?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleting}
      />
    </div>
    </AdminGuard>
  );
}