'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const categoryOptions = [
  { label: 'Calzado', value: 'footwear' },
  { label: 'Electrónica', value: 'electronics' },
  { label: 'Indumentaria', value: 'clothing' },
  { label: 'Accesorios', value: 'accessories' },
];

export default function AdminCreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    router.push('/admin/products');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.push('/admin/products')} className="mb-4">
          <ArrowLeft size={18} />
          Volver a productos
        </Button>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Crear Nuevo Producto</h1>
        <p className="mt-2 text-foreground-muted">Completa los detalles del producto para agregarlo al catálogo.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white border border-border shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground">Información básica</h2>

          <Input label="Título del producto" placeholder="Ej: Zapatillas Nike Air Max 270" required />

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Marca" placeholder="Ej: Nike" required />
            <Input label="Precio regular" type="number" placeholder="0.00" required />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Precio con descuento" type="number" placeholder="0.00" />
            <Input label="Descuento (%)" type="number" placeholder="0" min={0} max={100} />
          </div>

          <Input label="Descripción" placeholder="Describe el producto..." />
        </div>

        <div className="rounded-2xl bg-white border border-border shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground">Categorización</h2>

          <div className="grid gap-5 md:grid-cols-3">
            <Input label="Categoría principal" placeholder="Ej: Calzado" required />
            <Input label="Subcategoría" placeholder="Ej: Zapatillas" />
            <Input label="Categoría específica" placeholder="Ej: Running" />
          </div>

          <Select label="Tipo de producto" options={categoryOptions} placeholder="Selecciona una categoría" />
        </div>

        <div className="rounded-2xl bg-white border border-border shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground">Inventario</h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Cantidad en stock" type="number" placeholder="0" required />
            <Input label="Colores (separados por coma)" placeholder="negro, blanco, rojo" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Tallas disponibles</label>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <label key={size} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border cursor-pointer hover:bg-accent/5 transition-colors">
                  <input type="checkbox" className="rounded border-border text-accent focus:ring-accent" />
                  <span className="text-sm font-medium">{size}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-border shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground">Imagen</h2>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-background-alt flex items-center justify-center mx-auto mb-4">
              <Image size={24} className="text-foreground-muted" />
            </div>
            <p className="text-sm text-foreground-muted mb-1">Arrastra una imagen o haz clic para seleccionar</p>
            <p className="text-xs text-foreground-muted">PNG, JPG hasta 5MB</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" type="button" onClick={() => router.push('/admin/products')} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading} className="flex-1">
            Crear Producto
          </Button>
        </div>
      </form>
    </div>
  );
}