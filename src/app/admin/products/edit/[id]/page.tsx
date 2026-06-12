'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { AdminGuard } from '@/guards/AdminGuard';
import { ProductForm } from '@/components/forms/ProductForm';
import { AdminProductService } from '@/services/admin-product.service';
import { Product, CreateProductRequest } from '@/models/product.model';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AdminProductService.getById(productId);
        setProduct(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (data: CreateProductRequest) => {
    try {
      setSaving(true);
      setError(null);
      await AdminProductService.update(productId, data);
      setSuccess(true);
      setTimeout(() => {
        router.refresh();
        router.push('/admin/products');
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
    <div className="max-w-3xl mx-auto md:px-8 py-6 md:py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/admin/products')} className="mb-4">
          <ArrowLeft size={18} />
          Volver a productos
        </Button>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Editar Producto</h1>
        <p className="mt-2 text-foreground-muted">Modifica los detalles del producto.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
          Producto actualizado exitosamente. Redirigiendo...
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : product ? (
        <ProductForm
          mode="edit"
          initialData={product}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/products')}
          isLoading={saving}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-foreground-muted">Producto no encontrado</p>
          <Button variant="secondary" onClick={() => router.push('/admin/products')} className="mt-4">
            Volver a productos
          </Button>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}