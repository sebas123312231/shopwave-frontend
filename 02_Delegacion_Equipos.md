# ShopWave Fusion Frontend — Delegación de Equipos y Guía Técnica por Módulo

> **Rol:** Tech Lead / Arquitecto de Software  
> **Fecha:** Mayo 2026  
> **Requisito previo:** Haber completado íntegramente el documento `01_Base_Compartida_y_Estrategia.md` (base instalada, models, types, api.service.ts, AuthContext, Guards, Login, Register, Navbar y Home mínima).

---

## Cómo usar este documento

Cada equipo debe leer únicamente su sección asignada y la sección de **Reglas Transversales** al final.  
**No tocar archivos de otros equipos sin consenso grupal vía PR.**  
**Si un modelo o tipo no existe, extenderlo en su archivo correspondiente; no crear duplicados.**

---

## Equipo 1 — Catálogo, Home y Detalle de Producto (2 personas)

### Misión
Construir la cara visible de la tienda: homepage, listado de productos con filtros/búsqueda, y la página de detalle con reviews/ratings. Este módulo es **100% público** (no requiere autenticación para visualizar), aunque sí usa el contexto de auth para condicionar el botón "Agregar al carrito".

### Archivos y carpetas bajo su ownership
```
src/app/page.tsx                      (mejorar la home actual)
src/app/products/page.tsx             (listado + filtros)
src/app/products/[id]/page.tsx        (detalle de producto)
src/components/products/
  ├── ProductCard.tsx
  ├── ProductList.tsx
  ├── ProductFilter.tsx
  ├── ProductDetail.tsx
  └── ProductReviews.tsx
src/components/ui/
  ├── Badge.tsx
  ├── Button.tsx
  ├── Input.tsx
  └── Select.tsx
src/hooks/useProducts.ts
src/services/product.service.ts
```

### Endpoints que consumirán

| Método | Endpoint | Uso | Auth |
|--------|----------|-----|------|
| GET | `/products` | Listado simple (alternativa rápida) | No |
| GET | `/products/all?category=&colors=&sizes=&minPrice=&maxPrice=&minDiscount=&sort=&stock=&pageNumber=0&pageSize=12` | Listado paginado con filtros | No |
| GET | `/products/{productId}` | Detalle de producto | No |
| GET | `/products/products/search?q={query}` | Búsqueda por texto | No |
| GET | `/products/by-category?categoryName={name}&page=0&pageSize=12` | Filtro rápido por categoría | No |
| GET | `/reviews/product/{productId}` | Reviews del producto | No |
| GET | `/ratings/product/{productId}` | Ratings del producto | No |
| POST | `/reviews/create` | Crear review (solo si está logueado) | JWT |
| POST | `/ratings/create` | Crear rating (solo si está logueado) | JWT |

### Modelos y types a crear/modificar

Extender `src/models/product.model.ts` si falta algo (ya debería existir en base):
```typescript
// Asegurar que Rating y Review estén exportados
export interface Rating {
  id: number;
  user: User;
  product: Product;
  rating: number;
  createdAt: string;
}

export interface Review {
  id: number;
  review: string;
  user: User;
  product: Product;
  createdAt: string;
}
```

Crear `src/models/review.model.ts` (opcional, si prefieren separar):
```typescript
export interface CreateReviewRequest {
  productId: number;
  review: string;
}
```

Crear `src/models/rating.model.ts`:
```typescript
export interface CreateRatingRequest {
  productId: number;
  rating: number;
}
```

### Servicios a implementar

#### `src/services/product.service.ts`
```typescript
import { api } from './api.service';
import { Product } from '@/models/product.model';
import { Page } from '@/types/api-response.type';

interface FilterParams {
  category?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: string;
  stock?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    return api.get<Product[]>('/products', false);
  },

  getAllPaginated: async (params: FilterParams): Promise<Page<Product>> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, v));
        } else {
          query.append(key, String(value));
        }
      }
    });
    return api.get<Page<Product>>(`/products/all?${query.toString()}`, false);
  },

  getById: async (id: number): Promise<Product> => {
    return api.get<Product>(`/products/${id}`, false);
  },

  search: async (q: string): Promise<Product[]> => {
    return api.get<Product[]>(`/products/products/search?q=${encodeURIComponent(q)}`, false);
  },

  getByCategory: async (categoryName: string, page = 0, pageSize = 12): Promise<Page<Product>> => {
    return api.get<Page<Product>>(
      `/products/by-category?categoryName=${encodeURIComponent(categoryName)}&page=${page}&pageSize=${pageSize}`,
      false
    );
  },
};
```

#### `src/services/review.service.ts`
```typescript
import { api } from './api.service';
import { Review } from '@/models/product.model';

export const ReviewService = {
  getByProduct: async (productId: number): Promise<Review[]> => {
    return api.get<Review[]>(`/reviews/product/${productId}`, false);
  },

  create: async (productId: number, review: string): Promise<Review> => {
    return api.post<Review>('/reviews/create', { productId, review }, true);
  },
};
```

#### `src/services/rating.service.ts`
```typescript
import { api } from './api.service';
import { Rating } from '@/models/product.model';

export const RatingService = {
  getByProduct: async (productId: number): Promise<Rating[]> => {
    return api.get<Rating[]>(`/ratings/product/${productId}`, false);
  },

  create: async (productId: number, rating: number): Promise<Rating> => {
    return api.post<Rating>('/ratings/create', { productId, rating }, true);
  },
};
```

### Hooks

#### `src/hooks/useProducts.ts`
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductService } from '@/services/product.service';
import { Product } from '@/models/product.model';
import { Page } from '@/types/api-response.type';

interface UseProductsOptions {
  category?: string;
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: string;
  stock?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [data, setData] = useState<Page<Product> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await ProductService.getAllPaginated(options);
      setData(page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(options)]); // dependencia serializada para evitar re-renders infinitos

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { data, loading, error, refetch: fetchProducts };
};
```

### Componentes UI base (compartidos, creados por este equipo)

Crear componentes reutilizables en `src/components/ui/` para que los demás equipos los usen:

- `Button.tsx`: Variantes `primary`, `secondary`, `danger`, `ghost`. Props: `variant`, `size`, `disabled`, `loading`.
- `Input.tsx`: Con label, error message y estilos focus.
- `Select.tsx`: Wrapper nativo con estilos Tailwind.
- `Badge.tsx`: Para mostrar categorías, stock, descuentos.
- `Spinner.tsx`: Indicador de carga reutilizable.

### Instrucciones paso a paso

#### Paso 1: Componentes UI
Comiencen creando `Button`, `Input`, `Badge` y `Spinner`. Estos son bloques Lego para todo el proyecto.

#### Paso 2: ProductCard
```typescript
interface ProductCardProps {
  product: Product;
}
```
- Mostrar imagen (`imageUrl`), título, precio tachado si hay descuento, precio con descuento, badge de % descuento.
- Link a `/products/${product.id}`.
- Mobile-first: 1 columna en móvil, 2 en sm, 3 en md, 4 en lg.

#### Paso 3: Página de Listado (`/products`)
- Layout con sidebar de filtros (drawer en móvil) y grid de productos.
- Filtros soportados: categoría (input text o select), rango de precio (dos inputs numéricos), color (chips), talla (chips), orden (`sort=price_asc` o similar — revisar valores que acepta el backend; usa los strings que ya maneja Spring).
- Paginación: botones "Anterior / Siguiente" o números de página basados en `totalPages`.
- Barra de búsqueda que dispara `ProductService.search` y muestra resultados.

#### Paso 4: Página de Detalle (`/products/[id]`)
- Server Component posible para SEO (fetch inicial en el server) o Client Component con `useEffect`.
- Galería de imagen (una sola imagen por ahora).
- Selector de talla (map sobre `product.sizes` donde `quantity > 0`).
- Selector de cantidad.
- Botón **"Agregar al carrito"**: este botón NO pertenece a este equipo en lógica, pero sí en UI. Debe llamar a la función `addToCart` expuesta por el `CartContext` (ver Equipo 2). Por ahora, si el contexto aún no existe, dejar un `console.log` o un `alert` con un TODO que diga `// TODO: integrar con CartContext.addItem`.
- Sección de Reviews y Ratings (GET públicos). Si el usuario está autenticado, mostrar formularios para dejar review/rating (POST con auth).

#### Paso 5: Home (`/`)
- Banner hero con imagen de fondo y CTA a `/products`.
- Sección "Productos Destacados": usar `ProductService.getAll` y mostrar los primeros 8.
- Footer mínimo.

### Dependencias de otros equipos
- `CartContext.addItem` (Equipo 2) para el botón de agregar al carrito en el detalle.
- `AuthContext` (ya existe en base) para saber si mostrar formularios de review.

### Reglas de NO invasión
- No modificar `api.service.ts`.
- No modificar `AuthContext.tsx`.
- No crear páginas fuera de `app/products/` y `app/products/[id]/`.
- Si necesitan un tipo nuevo, lo agregan al modelo correspondiente, no crean archivos en `types/` arbitrarios.

---

## Equipo 2 — Carrito, Checkout, Órdenes y Perfil (2 personas)

### Misión
Gestionar todo el flujo de compra del usuario autenticado: carrito persistente, checkout simulado, historial de órdenes y perfil de usuario. Este es el módulo de mayor complejidad de estado porque interactúa con múltiples endpoints y requiere sincronización entre `CartContext` y el backend.

### Archivos y carpetas bajo su ownership
```
src/app/cart/page.tsx
src/app/checkout/page.tsx
src/app/orders/page.tsx
src/app/orders/[id]/page.tsx          (opcional pero recomendado)
src/app/profile/page.tsx
src/components/cart/
  ├── CartItemRow.tsx
  ├── CartSummary.tsx
  └── EmptyCart.tsx
src/components/orders/
  ├── OrderCard.tsx
  ├── OrderList.tsx
  └── OrderStatusBadge.tsx
src/components/forms/
  ├── CheckoutForm.tsx
  └── AddressForm.tsx
src/context/CartContext.tsx
src/hooks/useCart.ts
src/services/cart.service.ts
src/services/cartItem.service.ts
src/services/order.service.ts
src/services/user.service.ts
```

### Endpoints que consumirán

| Método | Endpoint | Uso | Auth |
|--------|----------|-----|------|
| GET | `/cart/` | Obtener carrito del usuario | JWT |
| PUT | `/cart/add` | Agregar item al carrito | JWT |
| PUT | `/cart_items/{cartItemId}` | Actualizar cantidad/talla de un item | JWT |
| DELETE | `/cart_items/{cartItemId}` | Eliminar item del carrito | JWT |
| POST | `/orders/` | Crear orden (checkout) | JWT |
| GET | `/orders/user` | Historial de órdenes | JWT |
| GET | `/orders/{orderId}` | Detalle de una orden | JWT |
| GET | `/users/profile` | Perfil del usuario | JWT |

### Modelos a crear/modificar

Asegurar que `src/models/cart.model.ts` tenga:
```typescript
export interface AddItemRequest {
  productId: number;
  size: string;
  quantity: number;
  price: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
  size: string;
}
```

Asegurar que `src/models/order.model.ts` tenga:
```typescript
export interface CreateOrderRequest {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  mobile: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentId: string;
  cardholderName: string;
  cardNumber: string;
}
```

### Servicios a implementar

#### `src/services/cart.service.ts`
```typescript
import { api } from './api.service';
import { Cart, CartItem } from '@/models/cart.model';
import { AddItemRequest } from '@/models/cart.model';

export const CartService = {
  getCart: async (): Promise<Cart> => {
    return api.get<Cart>('/cart/', true);
  },

  addItem: async (req: AddItemRequest): Promise<CartItem> => {
    return api.put<CartItem>('/cart/add', req, true);
  },
};
```

#### `src/services/cartItem.service.ts`
```typescript
import { api } from './api.service';
import { CartItem, UpdateCartItemRequest } from '@/models/cart.model';
import { ApiResponse } from '@/types/api-response.type';

export const CartItemService = {
  update: async (cartItemId: number, req: UpdateCartItemRequest): Promise<CartItem> => {
    return api.put<CartItem>(`/cart_items/${cartItemId}`, req, true);
  },

  remove: async (cartItemId: number): Promise<ApiResponse<void>> => {
    return api.del<ApiResponse<void>>(`/cart_items/${cartItemId}`, true);
  },
};
```

#### `src/services/order.service.ts`
```typescript
import { api } from './api.service';
import { Order } from '@/models/order.model';
import { CreateOrderRequest } from '@/models/order.model';

export const OrderService = {
  create: async (req: CreateOrderRequest): Promise<Order> => {
    return api.post<Order>('/orders/', req, true);
  },

  getUserOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>('/orders/user', true);
  },

  getById: async (orderId: number): Promise<Order> => {
    return api.get<Order>(`/orders/${orderId}`, true);
  },
};
```

#### `src/services/user.service.ts`
```typescript
import { api } from './api.service';
import { User } from '@/models/user.model';

export const UserService = {
  getProfile: async (): Promise<User> => {
    return api.get<User>('/users/profile', true);
  },
};
```

### Contexto global del Carrito

#### `src/context/CartContext.tsx`
Este contexto es **crítico** y debe ser creado por este equipo. Otros equipos (como el Equipo 1) lo consumirán para agregar items.

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '@/models/cart.model';
import { CartService } from '@/services/cart.service';
import { CartItemService } from '@/services/cartItem.service';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addItem: (productId: number, size: string, quantity: number, price: number) => Promise<void>;
  updateItem: (cartItemId: number, quantity: number, size: string) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CartService.getCart();
      setCart(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar carrito');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (productId: number, size: string, quantity: number, price: number) => {
    await CartService.addItem({ productId, size, quantity, price });
    await refreshCart();
  };

  const updateItem = async (cartItemId: number, quantity: number, size: string) => {
    await CartItemService.update(cartItemId, { quantity, size });
    await refreshCart();
  };

  const removeItem = async (cartItemId: number) => {
    await CartItemService.remove(cartItemId);
    await refreshCart();
  };

  useEffect(() => {
    const token = localStorage.getItem('shopwave_token');
    if (token) refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, loading, error, addItem, updateItem, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};
```

> **IMPORTANTE:** `CartProvider` debe envolver la app en `src/app/layout.tsx` (junto a `AuthProvider`). Esto requiere una modificación controlada al layout base. Hacer PR grupal para este cambio.

### Hooks

#### `src/hooks/useCart.ts`
```typescript
export { useCart } from '@/context/CartContext';
```

### Instrucciones paso a paso

#### Paso 1: Integrar CartProvider
Modificar `src/app/layout.tsx` para envolver con `<CartProvider>`.

#### Paso 2: Página del Carrito (`/cart`)
- Proteger con `<AuthGuard>`.
- Mostrar tabla/diseño card de los `cartItems`.
- Cada fila: imagen del producto, nombre, talla, cantidad (input numérico con botones +/-), precio unitario, subtotal, botón eliminar.
- Al cambiar cantidad, llamar `updateItem`.
- Al eliminar, llamar `removeItem` con confirmación.
- Resumen: total items, total price, total discounted price, ahorro.
- Botón "Proceder al checkout" que navega a `/checkout`.
- Estado vacío: ilustración + CTA a `/products`.

#### Paso 3: Checkout (`/checkout`)
- Proteger con `<AuthGuard>`.
- Formulario de dirección de envío (campos del `CreateOrderRequest`: firstName, lastName, streetAddress, city, state, zipCode, mobile).
- Selección de método de pago simulado (select con `PaymentMethod`).
- Campos de tarjeta simulados (cardholderName, cardNumber). No enviar datos reales; es una simulación.
- Botón "Confirmar Orden":
  1. Construir el `CreateOrderRequest`.
  2. Llamar `OrderService.create`.
  3. Si éxito, mostrar mensaje de confirmación con el `orderId` y redirigir a `/orders`.
- Manejo de errores: mostrar mensaje si falla (stock insuficiente, token inválido, etc.).

#### Paso 4: Historial de Órdenes (`/orders`)
- Proteger con `<AuthGuard>`.
- Lista de órdenes del usuario (`OrderService.getUserOrders`).
- Cada orden muestra: `orderId`, fecha, estado (con colores: verde entregado, amarillo enviado, rojo cancelado), total, total de items.
- Link a detalle de orden (opcional: `/orders/[id]` usando `OrderService.getById`).

#### Paso 5: Perfil (`/profile`)
- Proteger con `<AuthGuard>`.
- Mostrar datos del usuario (`UserService.getProfile`): nombre completo, email, móvil, rol.
- Listado de direcciones del usuario (si existen en el objeto `User`).
- No hay endpoint de edición de perfil en el backend, así que esta página es **solo lectura**.

### Dependencias de otros equipos
- `AuthContext` (ya existe) para saber si está autenticado.
- `CartContext` lo crean ustedes; el Equipo 1 lo consumirá.
- `Button`, `Input`, `Spinner` del Equipo 1 (reutilizar).

### Reglas de NO invasión
- No modificar `AuthContext.tsx`.
- No crear/modificar archivos en `app/products/`.
- No tocar `api.service.ts` salvo para reportar bugs al grupo.

---

## Equipo 3 — Panel Administrativo (1 persona)

### Misión
Construir el dashboard administrativo completo: CRUD de productos, gestión de órdenes globales y monitoreo de estados. Este módulo es **exclusivo para ADMIN** y debe estar protegido por `AdminGuard`.

### Archivos y carpetas bajo su ownership
```
src/app/admin/page.tsx                     (dashboard/resumen)
src/app/admin/products/page.tsx            (listado admin de productos)
src/app/admin/products/create/page.tsx     (formulario crear producto)
src/app/admin/products/edit/[id]/page.tsx  (formulario editar producto)
src/app/admin/orders/page.tsx              (listado global de órdenes)
src/components/forms/
  └── ProductForm.tsx                      (form reutilizable create/edit)
src/components/ui/
  ├── Table.tsx                            (tabla reutilizable)
  └── Modal.tsx                            (confirmación de eliminación)
src/services/admin-product.service.ts
src/services/admin-order.service.ts
```

### Endpoints que consumirán

| Método | Endpoint | Uso | Auth |
|--------|----------|-----|------|
| GET | `/products` | Listado de productos para admin | No |
| GET | `/products/{productId}` | Obtener producto para editar | No |
| POST | `/admin/products/` | Crear producto | JWT + ADMIN |
| PUT | `/admin/products/{productId}/update` | Actualizar producto | JWT + ADMIN |
| DELETE | `/admin/products/{productId}/delete` | Eliminar producto | JWT + ADMIN |
| POST | `/admin/products/creates` | Crear múltiples productos | JWT + ADMIN |
| GET | `/admin/orders/` | Listado global de órdenes | JWT + ADMIN |
| PUT | `/admin/orders/{orderId}/confirmed` | Confirmar orden | JWT + ADMIN |
| PUT | `/admin/orders/{orderId}/ship` | Marcar como enviada | JWT + ADMIN |
| PUT | `/admin/orders/{orderId}/deliver` | Marcar como entregada | JWT + ADMIN |
| PUT | `/admin/orders/{orderId}/cancel` | Cancelar orden | JWT + ADMIN |
| DELETE | `/admin/orders/{orderId}/delete` | Eliminar orden | JWT + ADMIN |

### Modelos a crear/modificar

Asegurar que `src/models/product.model.ts` incluya la interfaz para crear:
```typescript
export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  discountPersent: number;
  quantity: number;
  brand: string;
  color: string;
  size: Size[];
  imageUrl: string;
  topLevelCategory: string;
  secondLevelCategory: string;
  thirdLevelCategory: string;
}
```

### Servicios a implementar

#### `src/services/admin-product.service.ts`
```typescript
import { api } from './api.service';
import { Product } from '@/models/product.model';
import { CreateProductRequest } from '@/models/product.model';
import { ApiResponse } from '@/types/api-response.type';

export const AdminProductService = {
  create: async (req: CreateProductRequest): Promise<Product> => {
    return api.post<Product>('/admin/products/', req, true);
  },

  update: async (productId: number, req: Product): Promise<Product> => {
    return api.put<Product>(`/admin/products/${productId}/update`, req, true);
  },

  delete: async (productId: number): Promise<ApiResponse<void>> => {
    return api.del<ApiResponse<void>>(`/admin/products/${productId}/delete`, true);
  },

  createMultiple: async (reqs: CreateProductRequest[]): Promise<ApiResponse<void>> => {
    return api.post<ApiResponse<void>>('/admin/products/creates', reqs, true);
  },
};
```

#### `src/services/admin-order.service.ts`
```typescript
import { api } from './api.service';
import { Order } from '@/models/order.model';
import { ApiResponse } from '@/types/api-response.type';

export const AdminOrderService = {
  getAll: async (): Promise<Order[]> => {
    return api.get<Order[]>('/admin/orders/', true);
  },

  confirm: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/confirmed`, {}, true);
  },

  ship: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/ship`, {}, true);
  },

  deliver: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/deliver`, {}, true);
  },

  cancel: async (orderId: number): Promise<Order> => {
    return api.put<Order>(`/admin/orders/${orderId}/cancel`, {}, true);
  },

  delete: async (orderId: number): Promise<ApiResponse<void>> => {
    return api.del<ApiResponse<void>>(`/admin/orders/${orderId}/delete`, true);
  },
};
```

### Instrucciones paso a paso

#### Paso 1: Dashboard Admin (`/admin`)
- Proteger con `<AdminGuard>`.
- Layout con sidebar de navegación (responsive: drawer en móvil).
- Links: "Productos", "Órdenes".
- Cards de resumen: total de productos, total de órdenes, órdenes pendientes (contar del array).

#### Paso 2: Gestión de Productos (`/admin/products`)
- Tabla con columnas: ID, Imagen (miniatura), Título, Precio, Stock, Categoría, Acciones.
- Acciones: Editar (link a `/admin/products/edit/[id]`), Eliminar (modal de confirmación).
- Botón "Nuevo Producto" que navega a `/admin/products/create`.
- Paginación local o scroll infinito (el backend no pagina el listado admin directamente; usar `/products` que retorna un array).
- Filtro rápido por nombre (client-side) para facilitar la gestión.

#### Paso 3: Crear Producto (`/admin/products/create`)
- Formulario extenso con **validaciones**:
  - Título, descripción, marca, color: requeridos.
  - Precio > 0, discountedPrice <= price.
  - discountPersent calculado automáticamente en frontend (o ingresado manualmente).
  - quantity >= 0.
  - imageUrl debe ser una URL válida.
  - Categorías: topLevelCategory, secondLevelCategory, thirdLevelCategory (strings libres por ahora).
  - Tallas (`sizes`): array dinámico donde se agregan pares `{ name: string, quantity: number }`.
- Botón "Guardar": llamar `AdminProductService.create`. Mostrar toast de éxito/error. Redirigir a `/admin/products`.

#### Paso 4: Editar Producto (`/admin/products/edit/[id]`)
- Reutilizar el componente `ProductForm` en modo edición.
- Al cargar la página, hacer `ProductService.getById(id)` para poblar el formulario.
- Botón "Actualizar": llamar `AdminProductService.update`.

#### Paso 5: Gestión de Órdenes (`/admin/orders`)
- Tabla con columnas: OrderId, Cliente (user.email), Fecha, Estado, Total, Acciones.
- Acciones por fila:
  - Confirmar (solo si está PLACED/PENDING).
  - Enviar (solo si está CONFIRMED).
  - Entregar (solo si está SHIPPED).
  - Cancelar (si no está DELIVERED ni CANCELLED).
  - Eliminar (modal de confirmación).
- Filtros por estado (select).
- Ordenar por fecha descendente.

### Dependencias de otros equipos
- `AdminGuard` y `AuthContext` (ya existen en base).
- `Table`, `Button`, `Input`, `Modal` (pueden usar los del Equipo 1 o crear los propios si aún no existen).
- `ProductService.getById` (del Equipo 1) para la edición.

### Reglas de NO invasión
- No modificar `api.service.ts`.
- No modificar `AuthContext.tsx`.
- No crear rutas de admin fuera de `app/admin/`.
- No tocar la lógica de carrito ni órdenes de usuario (esa es del Equipo 2).

---

## Reglas Transversales para Todos los Equipos

### 1. Código limpio y evaluable
- **Cero lógica de fetch en componentes de UI.** Siempre importar desde `services/`.
- **Cero `any`.** Tipar todo. Si hay una respuesta extraña del backend, definir una interfaz para ella.
- **Componentes pequeños.** Máximo 150 líneas por componente. Extraer subcomponentes.

### 2. Manejo de errores obligatorio
Todo llamado a servicio debe estar envuelto en `try/catch`. Mostrar mensajes al usuario con un componente `ErrorMessage` o `Toast`. Ejemplo:
```typescript
try {
  await SomeService.action();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
  setError(message);
}
```

### 3. Estados de carga
Siempre tener un estado `loading` booleano que muestre el `Spinner` y deshabilite botones durante la mutación.

### 4. Responsive
- Mobile-first.
- Usar clases de Tailwind: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
- Tablas en móvil: convertir a cards o usar scroll horizontal (`overflow-x-auto`).
- Navbar hamburguesa (ya existe en base).

### 5. Git y colaboración
- Commits descriptivos y atómicos.
- Si un equipo necesita cambiar un archivo compartido (models, types, utils), crear una rama `feature/base-update`, hacer PR a `develop` y avisar en el grupo.
- Hacer `git pull origin develop` al inicio de cada sesión de trabajo para reducir conflictos.

### 6. Entrega al 60%
Los equipos deben coordinar para que, al momento de la entrega intermedia, el flujo mínimo funcione:
1. Visitante ve productos (Equipo 1).
2. Usuario se registra y loguea (base compartida).
3. Usuario agrega al carrito (Equipo 1 llama a CartContext del Equipo 2).
4. Usuario ve carrito (Equipo 2).
5. Usuario hace checkout y ve órdenes (Equipo 2).
6. Admin gestiona productos y órdenes (Equipo 3).

### 7. Entrega al 100%
- Validaciones de formularios en TODOS los inputs.
- Diseño pulido, colores consistentes, sombras, hover states.
- README técnico con instalación, variables de entorno, y estructura.
- Video corto mostrando flujo completo (sugerido: Loom o grabación de pantalla).

---

**¡A trabajar! Cada equipo tiene su dominio claro. Mantengan la comunicación abierta y respeten los límites de archivo para evitar conflictos.**
