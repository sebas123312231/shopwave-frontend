# Plan de Correcciones — ShopWave Frontend

## Rama: `fix/restore-commented-modules`
## Fecha: 2026-06-11

---

## 1. Diagnostico General

Se realizo una exploracion exhaustiva de los 50+ archivos del proyecto, incluyendo:
- Todos los archivos de `src/app/`, `src/components/`, `src/context/`, `src/services/`, `src/models/`, `src/hooks/`, `src/guards/`, `src/utils/`, `src/types/`
- Configuracion de seguridad del backend (`ProjectSecurityConfig.java`, `JWTTokenValidatorFilter.java`)
- Controladores del backend (`CartController.java`, `OrderController.java`, `CartItemController.java`)
- Pruebas directas contra el backend en Docker (puerto 8080)

---

## 2. Causa Raiz de los Errores 401 (Carrito y Ordenes)

### Hallazgo critico
Los controladores del backend mapean endpoints con **trailing slash**:
- `CartController`: `@RequestMapping("/cart")` + `@GetMapping("/")` = `GET /cart/`
- `OrderController`: `@RequestMapping("/orders")` + `@PostMapping("/")` = `POST /orders/`

El frontend llama **sin trailing slash**:
- `cart.service.ts`: `api.get('/cart', true)` → proxy a `GET /cart` → **401**
- `order.service.ts`: `api.post('/orders', req, true)` → proxy a `POST /orders` → **401**

### Verificacion empirica
| Endpoint | Sin trailing slash | Con trailing slash |
|---|---|---|
| `GET /cart` | 401 | 200 |
| `POST /orders` | 401 | 200 |
| `PUT /cart/add` | 202 | N/A |
| `PUT /cart_items/{id}` | 202 | N/A |
| `DELETE /cart_items/{id}` | 202 | N/A |
| `GET /orders/user` | 202 | N/A |
| `GET /orders/{id}` | 202 | N/A |

### Razon tecnica
Spring Security usa `requestMatchers("/cart/**")` que en Spring Boot 3 con `PathPatternParser` no matchea `/cart` sin trailing slash cuando el handler esta mapeado a `/cart/`. La solucion mas robusta es alinear las URLs del frontend con los endpoints del backend.

### Archivos a corregir
- `src/services/cart.service.ts`: cambiar `/cart` → `/cart/`
- `src/services/order.service.ts`: cambiar `/orders` → `/orders/`

---

## 3. Codigo Comentado a Restaurar

### 3.1 Modulo Carrito (4 archivos)

#### `src/app/cart/page.tsx`
- **Estado actual**: Placeholder "Esta seccion esta en desarrollo"
- **Codigo comentado**: Implementacion completa de la pagina (lineas 40-122)
- **Problemas detectados**:
  1. Import case-mismatch: `@/components/cart/CartItemRow` (PascalCase) vs archivo real `cartItemRow.tsx` (camelCase)
  2. Import case-mismatch: `@/components/cart/CartSummary` (PascalCase) vs archivo real `cartSummary.tsx` (camelCase)
  3. Estado `initStarted` innecesario (siempre `true`, patron muerto)
- **Correcciones**:
  - Corregir imports a camelCase: `cartItemRow`, `cartSummary`
  - Eliminar estado `initStarted` y simplificar logica de carga
  - Descomentar implementacion completa

#### `src/components/cart/cartItemRow.tsx`
- **Estado actual**: `export const CartItemRow = () => null`
- **Codigo comentado**: Componente completo con controles de cantidad y eliminacion (lineas 22-90)
- **Problemas detectados**:
  1. Usa `window.confirm()` en lugar del `Modal` component existente
  2. No maneja estado de error individual por item
- **Correcciones**:
  - Descomentar implementacion
  - Reemplazar `window.confirm()` con estado local de confirmacion (modal inline o patron existente)
  - Mantener la logica de `useCart()` para updateItem/removeItem

#### `src/components/cart/cartSummary.tsx`
- **Estado actual**: `export const CartSummary = () => null`
- **Codigo comentado**: Componente completo con resumen de totales (lineas 20-71)
- **Problemas detectados**:
  1. Usa `cart.discounte` — campo existe en el modelo `Cart` (line 18 de cart.model.ts), es consistente con el backend
- **Correcciones**:
  - Descomentar implementacion
  - El campo `discounte` es correcto (coincide con backend)

#### `src/components/cart/EmptyCart.tsx`
- **Estado actual**: `export const EmptyCart = () => null`
- **Codigo comentado**: Componente completo con estado vacio (lineas 19-43)
- **Problemas detectados**: Ninguno
- **Correcciones**: Descomentar implementacion

### 3.2 Navegacion Sidebar

#### `src/components/layout/Sidebar.tsx`
- **Lineas comentadas**: 54-57
  - "Mis Ordenes" (requiere auth)
  - "Carrito" (requiere auth)
- **Problemas detectados**:
  1. `ShoppingCart` NO esta importado en lucide-react (line 6-18) — causaria error al descomentar
  2. `ClipboardList` esta importado pero no se usa en codigo activo
- **Correcciones**:
  - Agregar `ShoppingCart` al import de lucide-react
  - Descomentar ambos nav items

### 3.3 Add-to-Cart en ProductDetail

#### `src/components/products/ProductDetail.tsx`
- **Lineas comentadas**: 69-95
  - Selector de cantidad, talla y boton "Agregar al carrito"
- **Problemas detectados**:
  1. El codigo comentado usa `CartContext.addItem()` directamente — deberia usar el hook `useCart()`
  2. Props `averageRating` y `ratingsCount` declaradas en la interfaz pero nunca desestructuradas/usadas
  3. No importa `Minus`, `Plus`, `ShoppingCart` de lucide-react
  4. No importa `Button` ni `useCart`
- **Correcciones**:
  - Reimplementar usando `useCart()` hook en lugar de acceso directo al contexto
  - Agregar imports necesarios (`useState`, `Minus`, `Plus`, `ShoppingCart`, `Button`, `useCart`)
  - Implementar seleccion de talla y cantidad con estado local
  - Conectar con `addItem()` del CartContext via `useCart()`
  - Limpiar props no usadas de la interfaz

### 3.4 Admin Dashboard

#### `src/app/admin/page.tsx`
- **Lineas comentadas**:
  - 176-182: Link "Ver Ordenes" a `/admin/orders`
  - 186-206: Panel "Ordenes recientes"
- **Problemas detectados**:
  1. El panel de ordenes recientes usa clases `bg-white` hardcoded (no soporta dark mode)
  2. `recentOrders`, `getStatusLabel()`, `getStatusColor()` son codigo muerto mientras esta comentado
- **Correcciones**:
  - Descomentar ambos bloques
  - Reemplazar `bg-white` con `bg-surface` para consistencia con dark mode
  - El codigo de `recentOrders` y helpers ya existe y es funcional

---

## 4. Correcciones Adicionales (Codigo Activo)

### 4.1 `src/app/orders/page.tsx`
- **Problema**: Estado `initStarted` (linea 36) es `useState(true)` y nunca cambia — la rama `!initStarted` (linea 71) es codigo muerto
- **Correccion**: Eliminar `initStarted` y simplificar la condicion de carga

### 4.2 `src/app/orders/[id]/page.tsx`
- **Problema**: Usa `order.discounte` (linea 174) — campo correcto segun modelo y backend
- **Estado**: No requiere cambio, es consistente

### 4.3 `src/app/admin/products/page.tsx`, `create/page.tsx`, `edit/[id]/page.tsx`
- **Problema**: Comentarios stray `//a` al final de cada archivo
- **Correccion**: Eliminar comentarios stray

### 4.4 `src/components/products/ProductDetail.tsx`
- **Problema**: Props `averageRating` y `ratingsCount` en la interfaz pero no usadas
- **Correccion**: Eliminar de la interfaz (se integraran cuando se conecte el sistema de reviews)

---

## 5. Orden de Ejecucion

1. **Fix servicios** (cart.service.ts, order.service.ts) — trailing slashes
2. **Descomentar componentes carrito** (EmptyCart, CartItemRow, CartSummary)
3. **Descomentar pagina carrito** (cart/page.tsx)
4. **Implementar add-to-cart** en ProductDetail
5. **Descomentar Sidebar** nav items
6. **Descomentar Admin** ordenes recientes
7. **Fix dead code** en orders/page.tsx
8. **Fix stray comments** en admin product files
9. **Build y lint** verification
10. **Pruebas end-to-end** contra backend Docker

---

## 6. Endpoints del Backend Verificados

| Endpoint | Metodo | Auth | Estado |
|---|---|---|---|
| `/products` | GET | No | 200 |
| `/products/{id}` | GET | No | 200 |
| `/auth/signin` | GET | Basic | 200 |
| `/auth/signup` | POST | No | 200 |
| `/cart/` | GET | JWT | 200 |
| `/cart/add` | PUT | JWT | 202 |
| `/cart_items/{id}` | PUT | JWT | 202 |
| `/cart_items/{id}` | DELETE | JWT | 202 |
| `/orders/` | POST | JWT | 200 |
| `/orders/user` | GET | JWT | 202 |
| `/orders/{id}` | GET | JWT | 202 |
| `/users/profile` | GET | JWT | 202 |

---

## 7. Riesgos y Consideraciones

1. **Backend puede tener mas bugs**: Si las pruebas frontend fallan, revisar controladores del backend
2. **Tipografia `discountPersent`**: Es un typo consistente en todo el proyecto (frontend + backend), no se corrige ahora para evitar breaking changes
3. **Tipografia `discounte`**: Tambien consistente en frontend y backend, se mantiene
4. **Dark mode**: Los componentes descomentados deben usar las clases del tema (`bg-surface`, `text-foreground`, etc.) en lugar de colores hardcoded (`bg-white`)
5. **Next.js 16**: El proyecto usa Next.js 16.2.6 con React 19.2.4 — verificar que no haya APIs deprecadas
