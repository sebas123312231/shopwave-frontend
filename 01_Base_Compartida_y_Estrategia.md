# ShopWave Fusion Frontend — Base Compartida y Estrategia Arquitectónica

> **Rol:** Tech Lead / Arquitecto de Software  
> **Fecha:** Mayo 2026  
> **Stack:** Next.js 16.2.4 (App Router) · React 19.2.4 · TypeScript 5 (strict) · Tailwind CSS v4 · Turbopack · Fetch API · JWT  
> **Backend:** Spring Boot expuesto en `http://localhost:8080` (Docker)

---

## 1. Análisis crítico del backend (lo que debe saber todo el equipo)

### 1.1 Autenticación y flujo JWT
El backend **no** devuelve el JWT en un JSON body. El flujo es el siguiente:

1. **Registro (`POST /auth/signup`)**:  
   Envia el objeto `User` (sin el campo `role`). El backend crea el usuario con `ROLE_USER`, le genera un carrito y retorna el objeto `User` creado.  
   **No devuelve token.** El usuario debe loguearse inmediatamente después.

2. **Login (`GET /auth/signin`)**:  
   No recibe body. Requiere **Basic Auth** en el header `Authorization`:
   ```
   Authorization: Basic base64(email:password)
   ```
   Si las credenciales son válidas, el backend responde con el **JWT en el header de respuesta `Authorization`**:
   ```
   Authorization: <jwt_token>
   ```
   > El token **NO** lleva prefijo `Bearer `. Es el token crudo.

3. **Requests autenticadas**:  
   Para **todos** los endpoints protegidos, se debe enviar el header:
   ```
   Authorization: <jwt_token>
   ```
   > De nuevo: **sin Bearer**, sin Basic, solo el token tal cual.

4. **Roles**:  
   - `ROLE_USER`: Cliente normal.  
   - `ROLE_ADMIN`: Administrador.  
   El token JWT contiene el claim `authorities` con el rol.

### 1.2 Endpoints públicos vs protegidos

| Método | Endpoint | Auth | Rol |
|--------|----------|------|-----|
| POST | `/auth/signup` | Público | — |
| GET | `/auth/signin` | Basic Auth | — |
| GET | `/products` | Público | — |
| GET | `/products/all` | Público | — |
| GET | `/products/{id}` | Público | — |
| GET | `/products/products/search?q=` | Público | — |
| GET | `/reviews/product/{id}` | Público | — |
| GET | `/ratings/product/{id}` | Público | — |
| GET | `/all` | USER / ADMIN | — |
| GET | `/cart/` | JWT | USER / ADMIN |
| PUT | `/cart/add` | JWT | USER / ADMIN |
| DELETE | `/cart_items/{id}` | JWT | USER / ADMIN |
| PUT | `/cart_items/{id}` | JWT | USER / ADMIN |
| POST | `/orders/` | JWT | USER / ADMIN |
| GET | `/orders/user` | JWT | USER / ADMIN |
| GET | `/orders/{id}` | JWT | USER / ADMIN |
| GET | `/users/profile` | JWT | USER / ADMIN |
| POST | `/reviews/create` | JWT | USER / ADMIN |
| POST | `/ratings/create` | JWT | USER / ADMIN |
| POST | `/admin/products/` | JWT | ADMIN |
| PUT | `/admin/products/{id}/update` | JWT | ADMIN |
| DELETE | `/admin/products/{id}/delete` | JWT | ADMIN |
| POST | `/admin/products/creates` | JWT | ADMIN |
| GET | `/admin/orders/` | JWT | ADMIN |
| PUT | `/admin/orders/{id}/confirmed` | JWT | ADMIN |
| PUT | `/admin/orders/{id}/ship` | JWT | ADMIN |
| PUT | `/admin/orders/{id}/deliver` | JWT | ADMIN |
| PUT | `/admin/orders/{id}/cancel` | JWT | ADMIN |
| DELETE | `/admin/orders/{id}/delete` | JWT | ADMIN |
| POST | `/admin/control/signup` | JWT | ADMIN |

### 1.3 Estructuras de respuesta clave
- **Listas paginadas:** Spring retorna un objeto `Page<T>` con `content`, `totalElements`, `totalPages`, `size`, `number`.
- **Mensajes simples:** `ApiResponse` → `{ message: string, status: boolean }`.
- **Error:** El backend lanza excepciones que retornan `ErrorDetails` (timestamp, message, details). El frontend debe manejar status `400`, `401`, `403`, `404`, `500`.

---

## 2. Setup inicial del proyecto (hacerlo UNA sola vez, todos juntos)

### 2.1 Crear el proyecto
```bash
npx create-next-app@16.2.4 shopwave-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --turbopack \
  --no-git
```

> **Nota:** Usamos `--no-git` para inicializar el repo nosotros mismos con una rama `main` limpia.

### 2.2 Instalar dependencias adicionales
```bash
cd shopwave-frontend
npm install jwt-decode lucide-react
npm install -D @types/node
```

### 2.3 Configurar TypeScript en modo estricto
Asegurarse de que `tsconfig.json` tenga:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2.4 Configurar Tailwind CSS v4
Tailwind v4 **no usa** `tailwind.config.js`. Se configura vía CSS.

En `src/app/globals.css`:
```css
@import "tailwindcss";

@theme {
  --color-primary: #0f172a;
  --color-accent: #3b82f6;
  /* Variables de tema personalizadas */
}
```

Eliminar cualquier archivo `tailwind.config.js` o `postcss.config.js` legacy si el CLI los crea.

### 2.5 Variables de entorno
Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> Usamos `NEXT_PUBLIC_` solo para la URL base. El token NUNCA va en variables de entorno.

---

## 3. Estructura de carpetas (crear TODO antes de separarse)

Ejecutar estos comandos para crear la estructura exacta exigida por el docente:

```bash
mkdir -p src/app/login
mkdir -p src/app/register
mkdir -p src/app/products
mkdir -p "src/app/products/[id]"
mkdir -p src/app/cart
mkdir -p src/app/checkout
mkdir -p src/app/orders
mkdir -p src/app/profile
mkdir -p src/app/admin/products
mkdir -p src/app/admin/products/create
mkdir -p src/app/admin/orders

mkdir -p src/components/layout
mkdir -p src/components/ui
mkdir -p src/components/products
mkdir -p src/components/cart
mkdir -p src/components/orders
mkdir -p src/components/forms

mkdir -p src/models
mkdir -p src/types
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/context
mkdir -p src/guards
mkdir -p src/utils
```

Crear los archivos base vacíos o con stubs para evitar errores de build:
```bash
touch src/models/product.model.ts
# ... (repetir para todos los archivos del diagrama del docente)
```

---

## 4. Capa de Modelos y Tipos (base tipada)

Crear los siguientes archivos con las interfaces extraídas del análisis del backend.

### `src/models/user.model.ts`
```typescript
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  mobile: string;
  createdAt: string; // ISO date string
  addresses: Address[];
  paymentInformation: PaymentInformation[];
}

export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  mobile: string;
}

export interface PaymentInformation {
  // Dejar abierto por ahora; el backend lo tiene como Embedded
}
```

### `src/models/auth.model.ts`
```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
}

export interface JwtPayload {
  username: string;
  authorities: string;
  iat: number;
  exp: number;
  iss: string;
  sub: string;
}
```

### `src/models/product.model.ts`
```typescript
export interface Category {
  id: number;
  name: string;
  parentCategory?: Category;
  level: number;
}

export interface Size {
  name: string;
  quantity: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  discountPersent: number;
  quantity: number;
  brand: string;
  color: string;
  sizes: Size[];
  imageUrl: string;
  numRatings: number;
  category: Category;
  createdAt: string;
  ratings?: Rating[];
  reviews?: Review[];
}

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

### `src/models/cart.model.ts`
```typescript
import { Product } from './product.model';

export interface CartItem {
  id: number;
  product: Product;
  size: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  userId: number;
}

export interface Cart {
  id: number;
  totalPrice: number;
  totalItem: number;
  totalDiscountedPrice: number;
  discounte: number;
  cartItems: CartItem[];
}
```

### `src/models/order.model.ts`
```typescript
import { Product } from './product.model';
import { Address } from './user.model';

export type OrderStatus = 'PENDING' | 'PLACED' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'UPI' | 'PAYPAL' | 'GOOGLE_PAY';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface PaymentDetails {
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paymentId: string;
  cardholderName: string;
  cardNumber: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  size: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  userId: number;
  deliveryDate?: string;
}

export interface Order {
  id: number;
  orderId: string;
  user: User;
  orderItems: OrderItem[];
  orderDate: string;
  deliveryDate?: string;
  shippingAddress: Address;
  paymentDetails: PaymentDetails;
  totalPrice: number;
  totalDiscountedPrice: number;
  discounte: number;
  orderStatus: OrderStatus;
  totalItem: number;
  createdAt: string;
}
```

### `src/types/api-response.type.ts`
```typescript
export interface ApiResponse<T> {
  message: string;
  status: boolean;
  data?: T;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

### `src/types/role.type.ts`
```typescript
export type Role = 'USER' | 'ADMIN';
```

### `src/types/form-state.type.ts`
```typescript
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
}
```

---

## 5. Utilidades base

### `src/utils/token.util.ts`
```typescript
const TOKEN_KEY = 'shopwave_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const decodeToken = (token: string): import('jwt-decode').JwtPayload => {
  const { jwtDecode } = require('jwt-decode');
  return jwtDecode(token);
};
```

### `src/utils/currency.util.ts`
```typescript
export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
  }).format(amount);
};
```

### `src/utils/validation.util.ts`
```typescript
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isNotEmpty = (value: string): boolean => value.trim().length > 0;

export const minLength = (value: string, min: number): boolean =>
  value.length >= min;
```

---

## 6. Servicio API Genérico (`api.service.ts`)

Este es el **corazón** de la comunicación con el backend. Todos los demás servicios lo consumen. **Ningún equipo debe modificar su firma sin consenso grupal.**

### `src/services/api.service.ts`
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }
  // Si la respuesta no tiene body (204), retornar void
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function getHeaders(requireAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = localStorage.getItem('shopwave_token');
    if (token) {
      // El backend espera el token SIN prefijo Bearer
      headers['Authorization'] = token;
    }
  }

  return headers;
}

export const api = {
  get: async <T>(url: string, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: getHeaders(requireAuth),
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, body: unknown, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(requireAuth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, body: unknown, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: getHeaders(requireAuth),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  del: async <T>(url: string, requireAuth = false): Promise<T> => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getHeaders(requireAuth),
    });
    return handleResponse<T>(response);
  },

  // Login especial con Basic Auth
  loginBasic: async (email: string, password: string): Promise<string> => {
    const basic = btoa(`${email}:${password}`);
    const response = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${basic}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Credenciales inválidas');
    }

    // El backend devuelve el JWT en el header de respuesta Authorization
    const jwt = response.headers.get('Authorization');
    if (!jwt) {
      throw new Error('No se recibió token de autenticación');
    }
    return jwt;
  },
};
```

> **Regla de oro:** Si un endpoint requiere auth, pasar `requireAuth = true`. La única excepción es el login, que usa `loginBasic`.

---

## 7. Servicio de Autenticación

### `src/services/auth.service.ts`
```typescript
import { api } from './api.service';
import { RegisterRequest } from '@/models/auth.model';
import { User } from '@/models/user.model';
import { setToken, removeToken } from '@/utils/token.util';

export const AuthService = {
  login: async (email: string, password: string): Promise<void> => {
    const jwt = await api.loginBasic(email, password);
    setToken(jwt);
  },

  register: async (data: RegisterRequest): Promise<User> => {
    return api.post<User>('/auth/signup', data, false);
  },

  logout: (): void => {
    removeToken();
    // Forzar recarga para limpiar estados globales de forma segura
    window.location.href = '/login';
  },
};
```

---

## 8. Contexto global de Autenticación

### `src/context/AuthContext.tsx`
```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, removeToken, decodeToken } from '@/utils/token.util';
import { JwtPayload } from '@/models/auth.model';
import { Role } from '@/types/role.type';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  role: Role | null;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isAdmin: boolean;
    userEmail: string | null;
    role: Role | null;
  }>({
    isAuthenticated: false,
    isAdmin: false,
    userEmail: null,
    role: null,
  });

  const refreshAuth = () => {
    const token = getToken();
    if (token) {
      try {
        const decoded = decodeToken(token) as JwtPayload;
        const authorities = decoded.authorities || '';
        const isAdmin = authorities.includes('ROLE_ADMIN');
        const role: Role = isAdmin ? 'ADMIN' : 'USER';
        setAuthState({
          isAuthenticated: true,
          isAdmin,
          userEmail: decoded.username,
          role,
        });
      } catch {
        removeToken();
        setAuthState({ isAuthenticated: false, isAdmin: false, userEmail: null, role: null });
      }
    } else {
      setAuthState({ isAuthenticated: false, isAdmin: false, userEmail: null, role: null });
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const logout = () => {
    removeToken();
    setAuthState({ isAuthenticated: false, isAdmin: false, userEmail: null, role: null });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ ...authState, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
```

> Nota: `useAuth` ya está definido aquí. El hook en `src/hooks/useAuth.ts` puede ser simplemente un re-export para cumplir con la estructura del docente:
```typescript
export { useAuth } from '@/context/AuthContext';
```

---

## 9. Guardianes de Rutas

Los Guards en Next.js App Router se implementan como **Client Components** que envuelven el contenido protegido y redirigen si no se cumplen las condiciones.

### `src/guards/AuthGuard.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-600">Redirigiendo al inicio de sesión...</p>
      </div>
    );
  }

  return <>{children}</>;
};
```

### `src/guards/AdminGuard.tsx`
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-red-600">Acceso denegado. Redirigiendo...</p>
      </div>
    );
  }

  return <>{children}</>;
};
```

---

## 10. Páginas y Layout iniciales

### `src/app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ShopWave Fusion',
  description: 'E-commerce moderno con Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### `src/components/layout/Navbar.tsx`
Componente responsive con menú hamburguesa, links condicionales según auth/rol, y botón de logout.

> **Nota:** Debe ser un Client Component (`'use client'`) porque usa `useAuth` y eventos de click.

Esqueleto mínimo:
```typescript
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-primary">
          ShopWave
        </Link>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <div className={`${open ? 'block' : 'hidden'} absolute left-0 top-14 w-full bg-white md:static md:block md:w-auto`}>
          <ul className="flex flex-col gap-4 px-4 py-2 md:flex-row md:items-center md:gap-6">
            <li><Link href="/products">Productos</Link></li>
            {isAuthenticated && (
              <>
                <li><Link href="/cart"><ShoppingCart size={20} /></Link></li>
                <li><Link href="/orders">Mis Órdenes</Link></li>
                <li><Link href="/profile"><User size={20} /></Link></li>
              </>
            )}
            {isAdmin && (
              <li><Link href="/admin" className="text-red-600">Admin</Link></li>
            )}
            {isAuthenticated ? (
              <li><button onClick={logout} className="text-sm font-semibold text-red-500">Salir</button></li>
            ) : (
              <>
                <li><Link href="/login">Ingresar</Link></li>
                <li><Link href="/register">Registro</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
```

### `src/app/login/page.tsx`
Formulario funcional que usa `AuthService.login` y luego redirige a `/`.

### `src/app/register/page.tsx`
Formulario funcional que usa `AuthService.register` y luego redirige a `/login` con mensaje de éxito.

### `src/app/page.tsx`
Homepage mínima: Hero banner, grid de productos destacados (puede usar `ProductService` para traer los primeros 8 productos de `/products`).

---

## 11. Estrategia Git para trabajar sin fricciones

### 11.1 Flujo de ramas
```
main        → producción estable, protegida
  ↓
develop     → integración continua del equipo
  ├── feature/equipo1-catalogo
  ├── feature/equipo2-carrito-ordenes
  └── feature/equipo3-admin
```

### 11.2 Reglas de convivencia
1. **Nunca se hace push directo a `develop` ni `main`.** Siempre mediante Pull Request (PR).
2. **Cada equipo tiene ownership de carpetas:**
   - `Equipo 1`: `app/products/`, `app/products/[id]/`, `components/products/`, `hooks/useProducts.ts`, `services/product.service.ts`.
   - `Equipo 2`: `app/cart/`, `app/checkout/`, `app/orders/`, `app/profile/`, `components/cart/`, `components/orders/`, `components/forms/CheckoutForm.tsx`, `hooks/useCart.ts`, `services/cart.service.ts`, `services/order.service.ts`, `services/user.service.ts`.
   - `Equipo 3**: `app/admin/`, `components/forms/ProductForm.tsx`, `services/admin-product.service.ts`, `services/admin-order.service.ts`.
3. **Archivos sagrados (solo tocar con consenso grupal o PR review cruzado):**
   - `src/services/api.service.ts`
   - `src/context/AuthContext.tsx`
   - `src/app/layout.tsx`
   - `src/utils/token.util.ts`
   - `tsconfig.json`
   - `.env.local`
   - `.eslintrc.json`
4. **Convención de commits** (para historial limpio y evaluación del docente):
   ```
   feat: agregar filtro por categoría en catálogo
   fix: corregir cálculo de total en carrito
   refactor: extraer hook useDebounce
   docs: actualizar README con instrucciones de instalación
   ```
5. **Cada integrante debe tener commits reales.** No se acepta que una sola persona haga todo el trabajo de un equipo. Usen pair programming pero commiteen desde ambas máquinas.
6. **Resolución de conflictos:** Si un equipo necesita una función nueva en `api.service.ts` o un campo nuevo en un modelo compartido, crean una rama `feature/base-utils`, hacen PR a `develop` y los demás hacen `git pull origin develop` en sus ramas.

### 11.3 Checklist antes de separarse en equipos
- [ ] `npm run dev` levanta sin errores.
- [ ] `npm run build` compila exitosamente.
- [ ] Login funciona contra `http://localhost:8080/auth/signin`.
- [ ] Register funciona contra `http://localhost:8080/auth/signup`.
- [ ] El token se persiste en `localStorage`.
- [ ] El Navbar muestra/oculta links según auth/rol.
- [ ] El logout limpia el token y redirige.
- [ ] Existe al menos un producto visible en la Home (prueba de que `api.service.ts` funciona).
- [ ] Todos los archivos base están creados (estructura de carpetas completa).
- [ ] El repo está en GitHub, rama `develop` creada, y todos los integrantes tienen acceso.

---

## 12. Notas para la evaluación del docente

- **SoC (Separación de Concerns):** La lógica de API vive exclusivamente en `services/`. Los componentes solo importan servicios y hooks.
- **Manejo de errores:** `api.service.ts` lanza excepciones con mensajes legibles. Cada página debe tener bloques `try/catch` alrededor de las llamadas a servicios y mostrar mensajes al usuario.
- **Estados de carga:** Todo fetch debe tener un estado `loading` que deshabilite botones y muestre spinners.
- **Responsive:** Tailwind v4 con Mobile-First (`sm:`, `md:`, `lg:`). Probar en pantallas < 375px.
- **Tipado estricto:** `any` está prohibido salvo en casos justificados y documentados.

---

**Fin del documento base. Una vez completado el checklist de la sección 11.3, los equipos pueden comenzar su trabajo en paralelo siguiendo el documento `02_Delegacion_Equipos.md`.**
