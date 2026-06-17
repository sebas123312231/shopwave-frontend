'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Product, CreateProductRequest } from '@/models/product.model';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: Product;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const defaultFormData: CreateProductRequest = {
  title: '',
  description: '',
  price: 0,
  discountedPrice: 0,
  discountPersent: 0,
  quantity: 0,
  brand: '',
  color: '',
  size: [],
  imageUrl: '',
  topLevelCategory: '',
  secondLevelCategory: '',
  thirdLevelCategory: '',
};

export const ProductForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) => {
  const [formData, setFormData] = useState<CreateProductRequest>(() => {
    if (initialData && mode === 'edit') {
      return {
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        discountedPrice: initialData.discountedPrice,
        discountPersent: initialData.discountPersent,
        quantity: initialData.quantity,
        brand: initialData.brand,
        color: initialData.color,
        size: initialData.sizes || [],
        imageUrl: initialData.imageUrl,
        topLevelCategory: initialData.category?.parentCategory?.parentCategory?.name || '',
        secondLevelCategory: initialData.category?.parentCategory?.name || '',
        thirdLevelCategory: initialData.category?.name || '',
      };
    }
    return defaultFormData;
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [newSize, setNewSize] = useState<{ name: string; quantity: number }>({ name: '', quantity: 0 });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: initialData.title,
        description: initialData.description,
        price: initialData.price,
        discountedPrice: initialData.discountedPrice,
        discountPersent: initialData.discountPersent,
        quantity: initialData.quantity,
        brand: initialData.brand,
        color: initialData.color,
        size: initialData.sizes || [],
        imageUrl: initialData.imageUrl,
        topLevelCategory: initialData.category?.parentCategory?.parentCategory?.name || '',
        secondLevelCategory: initialData.category?.parentCategory?.name || '',
        thirdLevelCategory: initialData.category?.name || '',
      });
    }
  }, [initialData, mode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.brand.trim()) newErrors.brand = 'La marca es requerida';
    if (!formData.color.trim()) newErrors.color = 'El color es requerido';
    if (formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (formData.discountedPrice > formData.price) {
      newErrors.discountedPrice = 'El precio con descuento no puede ser mayor al precio regular';
    }
    if (formData.quantity < 0) newErrors.quantity = 'La cantidad no puede ser negativa';

    const sizesTotal = formData.size.reduce((sum, size) => sum + (Number(size.quantity) || 0), 0);
    if (formData.size.length === 0) {
      newErrors.size = 'Debes definir al menos una talla antes de crear el producto';
    } else if (sizesTotal !== formData.quantity) {
      newErrors.size =
        `Las tallas suman ${sizesTotal} unidades, pero el stock total es ${formData.quantity}. Deben coincidir.`;
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'La URL de imagen es requerida';
    } else if (!isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'La URL de imagen no es válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (field: keyof CreateProductRequest, value: string | number) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === 'price' || field === 'discountedPrice') {
        const price = field === 'price' ? Number(value) : prev.price;
        const discountedPrice = field === 'discountedPrice' ? Number(value) : prev.discountedPrice;

        if (price > 0 && discountedPrice > 0 && discountedPrice <= price) {
          updated.discountPersent = Math.round(((price - discountedPrice) / price) * 100);
        } else if (discountedPrice === 0) {
          updated.discountPersent = 0;
          updated.discountedPrice = price;
        }
      }

      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddSize = () => {
    if (!newSize.name.trim()) return;
    if (newSize.quantity < 0) return;
    setFormData((prev) => ({
      ...prev,
      size: [...prev.size, { name: newSize.name.trim(), quantity: newSize.quantity }],
    }));
    setNewSize({ name: '', quantity: 0 });
  };

  const sizesTotal = formData.size.reduce((sum, size) => sum + (Number(size.quantity) || 0), 0);
  const sizesMatchStock = sizesTotal === formData.quantity;

  const handleRemoveSize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      size: prev.size.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-foreground">Información básica</h2>

        <Input
          label="Título del producto"
          placeholder="Ej: Zapatillas Nike Air Max 270"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          required
        />

        <Input
          label="Descripción"
          placeholder="Describe el producto..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          required
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Marca"
            placeholder="Ej: Nike"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            error={errors.brand}
            required
          />
          <Input
            label="Color"
            placeholder="Ej: negro, blanco"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            error={errors.color}
            required
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Input
            label="Precio regular"
            type="number"
            placeholder="0.00"
            value={formData.price || ''}
            onChange={(e) => handleChange('price', Number(e.target.value))}
            error={errors.price}
            required
          />
          <Input
            label="Precio con descuento"
            type="number"
            placeholder="0.00"
            value={formData.discountedPrice || ''}
            onChange={(e) => handleChange('discountedPrice', Number(e.target.value))}
            error={errors.discountedPrice}
          />
          <Input
            label="Descuento (%)"
            type="number"
            placeholder="0"
            value={formData.discountPersent}
            readOnly
          />
        </div>

        <Input
          label="Cantidad en stock"
          type="number"
          placeholder="0"
          value={formData.quantity || ''}
          onChange={(e) => handleChange('quantity', Number(e.target.value))}
          error={errors.quantity}
          required
        />
      </div>

      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-foreground">Categorización</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <Input
            label="Categoría principal"
            placeholder="Ej: Calzado"
            value={formData.topLevelCategory}
            onChange={(e) => handleChange('topLevelCategory', e.target.value)}
            required
          />
          <Input
            label="Subcategoría"
            placeholder="Ej: Zapatillas"
            value={formData.secondLevelCategory}
            onChange={(e) => handleChange('secondLevelCategory', e.target.value)}
          />
          <Input
            label="Categoría específica"
            placeholder="Ej: Running"
            value={formData.thirdLevelCategory}
            onChange={(e) => handleChange('thirdLevelCategory', e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">Tallas</h2>
            <p className="text-xs text-foreground-muted mt-0.5">
              La suma de unidades por talla debe coincidir con el stock total indicado arriba.
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
              sizesTotal === formData.quantity
                ? 'bg-surface-green text-text-on-green border-border-green'
                : 'bg-surface-amber text-text-on-amber border-border-amber'
            }`}
          >
            <span>
              Tallas: {sizesTotal} / Stock: {formData.quantity}
            </span>
            {sizesTotal === formData.quantity ? (
              <span aria-hidden="true">✓</span>
            ) : (
              <span aria-hidden="true">!</span>
            )}
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Nombre de talla"
              placeholder="Ej: M, L, XL"
              value={newSize.name}
              onChange={(e) => setNewSize((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Cantidad"
              type="number"
              placeholder="0"
              value={newSize.quantity || ''}
              onChange={(e) => setNewSize((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
            />
          </div>
          <Button type="button" variant="secondary" onClick={handleAddSize}>
            <Plus size={18} />
            Agregar
          </Button>
        </div>

        {errors.size && (
          <p className="text-xs text-error font-medium -mt-2">{errors.size}</p>
        )}

        {formData.size.length > 0 && (
          <div className="space-y-2">
            {formData.size.map((size, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-background-alt border border-border"
              >
                <span className="text-sm font-medium text-foreground">
                  {size.name} - {size.quantity} unidades
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSize(index)}
                  className="p-1 rounded-lg hover:bg-error/10 text-error transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-foreground">Imagen</h2>

        <Input
          label="URL de la imagen"
          placeholder="https://example.com/imagen.jpg"
          value={formData.imageUrl}
          onChange={(e) => handleChange('imageUrl', e.target.value)}
          error={errors.imageUrl}
          required
        />

        {formData.imageUrl && isValidUrl(formData.imageUrl) && (
          <div className="mt-4">
            <p className="text-sm text-foreground-muted mb-2">Vista previa:</p>
            <img
              src={formData.imageUrl}
              alt="Vista previa"
              className="h-40 w-40 rounded-xl object-cover border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1" disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          className="flex-1"
          disabled={isLoading || !sizesMatchStock || formData.size.length === 0}
        >
          {mode === 'create' ? 'Crear Producto' : 'Actualizar Producto'}
        </Button>
      </div>
    </form>
  );
};
