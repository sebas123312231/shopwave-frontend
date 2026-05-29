'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminGuard } from '@/guards/AdminGuard';
import { ProductForm } from '@/components/forms/ProductForm';
import { AdminProductService } from '@/services/admin-product.service';
import { CreateProductRequest } from '@/models/product.model';

export default function AdminCreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await AdminProductService.create(data);
      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push('/admin/products');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminGuard>
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/admin/products')} className="mb-4">
          <ArrowLeft size={18} />
          Volver a productos
        </Button>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Crear Nuevo Producto</h1>
        <p className="mt-2 text-foreground-muted">Completa los detalles del producto para agregarlo al catálogo.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
          Producto creado exitosamente. Redirigiendo...
        </div>
      )}

      <ProductForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/products')}
        isLoading={isLoading}
      />
    </div>
    </AdminGuard>
  );
}
//a