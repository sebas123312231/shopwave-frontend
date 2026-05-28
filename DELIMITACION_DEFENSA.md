# ShopWave Fusion — Delimitación de Defensa del Proyecto (Entrega 60%)

> **Fecha:** Mayo 2026
> **Total de integrantes:** 5 personas (3 equipos)
> **Entrega:** 60% — Funcionalidad base del e-commerce

---

## Resumen Visual de Distribución

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHOPWAVE FUSION - DEFENSA 60%                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  EQUIPO 1 (2 personas) — Catálogo y Productos                      │
│  ├── Persona A: Home (/) + Listado de Productos (/products)        │
│  └── Persona B: Detalle de Producto (/products/[id]) + Filtros     │
│                                                                     │
│  EQUIPO 2 (2 personas) — Autenticación y Navegación                │
│  ├── Persona C: Login + Register + JWT + AuthContext               │
│  └── Persona D: Navbar + Layout + Perfil + Guards + Proxy API      │
│                                                                     │
│  EQUIPO 3 (1 persona) — Panel Administrativo                       │
│  └── Persona E: Dashboard + CRUD Productos + Órdenes Admin         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Conocimientos Transversales (TODOS deben saber)

Antes de la delimitación individual, **todos los integrantes** deben poder explicar:

| Tema | Qué deben saber |
|------|-----------------|
| **Components UI** | Cómo funcionan los componentes reutilizables (Button, Input, Badge, Spinner, Modal, Select). Poder explicar props, variantes y por qué se usan. |
| **Hooks** | Qué es un hook personalizado, para qué sirve `useProducts`, `useAuth`, `useCart`. Cómo encapsulan lógica de estado y efectos. |
| **Models** | Las interfaces TypeScript principales: `Product`, `User`, `Order`, `Cart`, `CreateProductRequest`. Por qué se usan tipos estrictos. |
| **Services** | La capa de servicios desacoplada. Cómo `api.service.ts` centraliza las llamadas HTTP. Cómo cada servicio (product, auth, admin-product, etc.) consume la API. |
| **Types** | `ApiResponse<T>`, `Page<T>`, `Role`. Por qué se usan generics. |
| **Utils** | `token.util.ts` (manejo JWT), `currency.util.ts` (formato BOB), `validation.util.ts` (validación email). |

---

## EQUIPO 1 — Catálogo y Productos (2 personas)

### Persona A: Home + Listado de Productos

**Responsable de:** La cara principal de la tienda y el catálogo completo.

#### Páginas principales que defiende

| Página | Ruta | Descripción |
|--------|------|-------------|
| **Home** | `/` | Página de inicio con hero banner, productos destacados (8 primeros), CTA al catálogo |
| **Listado de Productos** | `/products` | Catálogo completo con filtros, búsqueda, paginación client-side |

#### Archivos bajo su ownership

```
src/app/page.tsx                          ← Home page
src/app/products/page.tsx                 ← Listado con filtros
src/components/products/ProductCard.tsx   ← Tarjeta de producto reutilizable
src/components/products/ProductList.tsx   ← Grid de productos con estados
src/hooks/useProducts.ts                  ← Hook de fetching con filtros y debounce
src/services/product.service.ts           ← Servicio de productos (getAll, getFiltered, search)
```

#### Qué debe demostrar en la defensa

1. **Home Page:**
   - Hero section con imagen de fondo y CTA
   - Sección "Productos destacados" que carga dinámicamente del backend
   - Link "Ver catálogo" que navega a `/products`
   - Footer mínimo

2. **Listado de Productos:**
   - Grid responsive (1 col mobile → 4 col desktop)
   - Filtros funcionales: categoría, precio min/max, descuento mínimo, ordenamiento
   - Búsqueda con debounce de 400ms
   - Paginación client-side (12 productos por página)
   - Estados: loading (Spinner), error (mensaje), vacío (CTA a explorar)

3. **ProductCard:**
   - Imagen, título, marca, precio con descuento, badge de % descuento
   - Link a `/products/{id}`
   - Formato de precio en Bolivianos (BOB)

4. **useProducts Hook:**
   - Fetching con debounce para búsqueda
   - Filtros aplicados client-side sobre array completo
   - Serialización de filtros para evitar re-renders infinitos
   - Retorno de `Page<Product>` con metadata de paginación

5. **ProductService:**
   - `getProducts(page, size)` → slice client-side
   - `getFilteredProducts(filters)` → filtros complejos en cliente
   - `searchProducts(query)` → endpoint `/products/products/search`
   - Por qué se hace filtrado client-side (backend no soporta todos los filtros)

#### Preguntas que le pueden hacer

- ¿Por qué filtran en el cliente y no en el servidor?
- ¿Cómo funciona el debounce en la búsqueda?
- ¿Qué es `Page<T>` y por qué lo construyen localmente?
- ¿Cómo manejan el estado de carga y error?
- ¿Por qué usan `useMemo` para serializar filtros?

---

### Persona B: Detalle de Producto + Filtros Avanzados

**Responsable de:** La experiencia de ver un producto individual y el sistema de filtros visual.

#### Páginas principales que defiende

| Página | Ruta | Descripción |
|--------|------|-------------|
| **Detalle de Producto** | `/products/[id]` | Vista completa de un producto con tallas, precios, categoría |

#### Archivos bajo su ownership

```
src/app/products/[id]/page.tsx            ← Detalle dinámico por ID
src/components/products/ProductDetail.tsx ← Layout del detalle
src/components/products/ProductFilter.tsx ← Panel de filtros visual
src/components/products/ProductReviews.tsx ← Sección de reviews (preparada para 100%)
src/services/review.service.ts            ← Servicio de reviews
src/services/rating.service.ts            ← Servicio de ratings
```

#### Qué debe demostrar en la defensa

1. **Detalle de Producto:**
   - Carga dinámica con `useParams` para extraer el ID
   - Fetch del producto individual con `ProductService.getProduct(id)`
   - Galería de imagen (imagen principal)
   - Información: título, marca, precio original tachado, precio con descuento, % descuento
   - Tallas disponibles (filtra las que tienen `quantity > 0`)
   - Badge de categoría y stock
   - Estados: loading, error, producto no encontrado

2. **ProductDetail Component:**
   - Layout responsive: grid 2 columnas en desktop, 1 en mobile
   - Sección de información con precios formateados
   - Tallas como chips/badges
   - Bloque de "Agregar al carrito" comentado (preparado para entrega 100%)

3. **ProductFilter Component:**
   - Sidebar de filtros (drawer en mobile)
   - Inputs: categoría, precio min/max, descuento mínimo
   - Selects: ordenamiento (price_asc, price_desc, discount), stock
   - Inputs de texto: colores y tallas (separados por coma)
   - Aviso "Filtros desactivados durante búsqueda"
   - Botón "Limpiar filtros"

4. **ProductReviews (preparado para 100%):**
   - Componente existe pero no se integra en la página de detalle
   - Formularios de review y rating (requieren auth)
   - Listado de reviews existentes
   - Explicar que está listo para activar en la entrega del 100%

5. **Ruta dinámica `[id]`:**
   - Cómo Next.js maneja rutas dinámicas con App Router
   - `useParams` para extraer el parámetro
   - Validación del ID (debe ser número positivo)

#### Preguntas que le pueden hacer

- ¿Cómo funciona la ruta dinámica `[id]` en Next.js App Router?
- ¿Por qué el bloque de carrito está comentado?
- ¿Cómo filtran las tallas disponibles?
- ¿Qué pasa si el producto no existe?
- ¿Cómo funciona el ProductFilter y cómo se comunica con el hook?

---

## EQUIPO 2 — Autenticación y Navegación (2 personas)

### Persona C: Login + Register + JWT + AuthContext

**Responsable de:** Todo el flujo de autenticación del usuario.

#### Páginas principales que defiende

| Página | Ruta | Descripción |
|--------|------|-------------|
| **Login** | `/login` | Formulario de inicio de sesión con Basic Auth |
| **Register** | `/register` | Formulario de registro de nuevos usuarios |

#### Archivos bajo su ownership

```
src/app/login/page.tsx                    ← Página de login
src/app/register/page.tsx                 ← Página de registro
src/context/AuthContext.tsx               ← Context global de autenticación
src/services/auth.service.ts              ← Servicio de auth (login, register)
src/utils/token.util.ts                   ← Utilidades JWT (get, set, decode, isExpired)
src/models/auth.model.ts                  ← Modelos de auth (LoginRequest, RegisterRequest, JwtPayload)
```

#### Qué debe demostrar en la defensa

1. **Login:**
   - Formulario con email y password
   - Llamada a `AuthService.login(email, password)` que usa Basic Auth
   - El backend devuelve JWT en header `Authorization`
   - Token se guarda en `localStorage` con clave `shopwave_token`
   - Redirección a `/` con `window.location.href` (forzar reload para refrescar AuthContext)
   - Manejo de errores: credenciales inválidas, servidor caído

2. **Register:**
   - Formulario con 5 campos: firstName, lastName, email, password, mobile
   - Llamada a `AuthService.register(data)` que hace POST a `/auth/signup`
   - Mensaje de éxito + redirección a `/login` después de 2 segundos
   - Validación de email con regex
   - Manejo de errores: email duplicado, campos inválidos

3. **AuthContext:**
   - Provider que envuelve toda la app en `layout.tsx`
   - Al montar: lee token de `localStorage`, lo decodifica con `jwtDecode`
   - Extrae `username` (email) y `authorities` del payload JWT
   - Determina `isAdmin` verificando `authorities.includes('ROLE_ADMIN')`
   - Expone: `isAuthenticated`, `isAdmin`, `userEmail`, `role`, `isLoading`
   - Método `logout()`: elimina token y resetea estado
   - Escucha evento `auth:unauthorized` (disparado por api.service en 401)

4. **JWT Flow:**
   - Login envía `Authorization: Basic <base64(email:password)>`
   - Backend responde con JWT en header `Authorization` (sin prefijo Bearer)
   - `api.service.ts` extrae el token (busca en header, body, o texto plano)
   - Token se guarda sin prefijo en `localStorage`
   - Requests protegidas envían el token crudo en header `Authorization`
   - Expiración: ~33 horas según backend

5. **token.util.ts:**
   - `getToken()`: lee de localStorage
   - `setToken(token)`: guarda sin prefijo Bearer
   - `removeToken()`: elimina
   - `isTokenExpired(token)`: decodifica y compara `exp` con `Date.now()`
   - `decodeToken(token)`: usa `jwt-decode`

#### Preguntas que le pueden hacer

- ¿Por qué usan Basic Auth para login en lugar de POST con body?
- ¿Dónde se guarda el JWT y por qué localStorage y no cookies?
- ¿Cómo detectan si el token expiró?
- ¿Qué pasa cuando el backend devuelve 401?
- ¿Por qué hacen `window.location.href = '/'` en lugar de `router.push('/')`?
- ¿Qué claims tiene el JWT y cómo los usan?

---

### Persona D: Navbar + Layout + Perfil + Guards + Proxy API

**Responsable de:** La estructura visual global, la protección de rutas y la infraestructura de proxy.

#### Páginas principales que defiende

| Página | Ruta | Descripción |
|--------|------|-------------|
| **Perfil** | `/profile` | Datos del usuario autenticado (solo lectura) |

#### Archivos bajo su ownership

```
src/app/layout.tsx                        ← Layout raíz (providers, estructura HTML)
src/app/profile/page.tsx                  ← Perfil de usuario
src/components/layout/Sidebar.tsx         ← Navbar/sidebar responsive
src/guards/AuthGuard.tsx                  ← Guard para rutas protegidas
src/guards/AdminGuard.tsx                 ← Guard para rutas admin
src/app/api/[...path]/route.ts            ← Proxy Next.js → Backend
src/services/user.service.ts              ← Servicio de perfil de usuario
src/services/api.service.ts               ← Capa base HTTP (fetch, headers, parseo)
```

#### Qué debe demostrar en la defensa

1. **Layout:**
   - Estructura HTML global con `<html>` y `<body>`
   - Providers anidados: `AuthProvider` → `CartProvider` → `children`
   - Sidebar/Navbar incluido en el layout
   - Fuente y estilos globales de `globals.css`

2. **Sidebar/Navbar:**
   - Responsive: sidebar fijo en desktop, hamburger menu en mobile
   - Links condicionales según rol:
     - Todos: Home, Productos
     - Autenticados: Carrito, Órdenes, Perfil
     - Admin: Panel Admin
   - Muestra email del usuario y botón de logout
   - Iniciales del usuario como avatar
   - Animación de apertura/cierre

3. **Perfil de Usuario:**
   - Protegido con `AuthGuard`
   - Fetch de `UserService.getProfile()` → `GET /users/profile`
   - Muestra: nombre completo, email, móvil, rol (badge ADMIN/USER)
   - Estados: loading, error
   - Solo lectura (no hay endpoint de edición)

4. **Guards:**
   - **AuthGuard:** verifica `isAuthenticated`. Si no → redirect a `/login`. Muestra "Verificando sesión..." mientras carga.
   - **AdminGuard:** verifica `isAuthenticated` + `isAdmin`. Si no auth → `/login`. Si auth pero no admin → `/`. Muestra "Verificando permisos..."
   - Ambos son componentes wrapper que envuelven el JSX de las páginas

5. **Proxy API (`[...path]/route.ts`):**
   - Catch-all route que captura `/api/*`
   - Reenvía al backend en `http://localhost:8080/*`
   - Preserva headers (excepto hop-by-hop)
   - Maneja redirects 308/301/302 manualmente (preserva Authorization)
   - `cleanResponseBody()`: limpia respuestas malformadas de Hibernate
   - Reemplaza `"hibernateLazyInitializer"` con `null`
   - Extrae JSON válido de respuestas mixtas

6. **api.service.ts:**
   - Métodos: `get`, `post`, `put`, `del`, `loginBasic`
   - `getHeaders(requireAuth)`: inyecta token si es necesario
   - `handleResponse()`: maneja 401 (dispatch event), parsea errores
   - `parseJsonSafe()`: parser JSON tolerante a respuestas malformadas
   - `cache: 'no-store'` en GET para evitar cacheo

#### Preguntas que le pueden hacer

- ¿Por qué usan un proxy en Next.js en lugar de llamar directamente al backend?
- ¿Cómo funciona el catch-all route `[...path]`?
- ¿Qué es `cleanResponseBody` y por qué es necesario?
- ¿Cómo funcionan los Guards y por qué son componentes y no middleware?
- ¿Por qué el Sidebar es responsive y cómo lo logran?
- ¿Cómo manejan los errores de red en `api.service.ts`?
- ¿Qué es el evento `auth:unauthorized` y quién lo escucha?

---

## EQUIPO 3 — Panel Administrativo (1 persona)

### Persona E: Panel Admin Completo

**Responsable de:** Todo el panel de administración (CRUD de productos y gestión de órdenes globales).

#### Páginas principales que defiende

| Página | Ruta | Descripción |
|--------|------|-------------|
| **Dashboard Admin** | `/admin` | Resumen con stats reales (total productos, órdenes, pendientes) |
| **Gestión Productos** | `/admin/products` | Tabla con búsqueda, editar, eliminar |
| **Crear Producto** | `/admin/products/create` | Formulario completo con validaciones |
| **Editar Producto** | `/admin/products/edit/[id]` | Formulario precargado con datos existentes |
| **Gestión Órdenes** | `/admin/orders` | Tabla con acciones de estado (confirmar, enviar, entregar, cancelar) |

#### Archivos bajo su ownership

```
src/app/admin/page.tsx                            ← Dashboard con stats
src/app/admin/products/page.tsx                   ← Listado admin de productos
src/app/admin/products/create/page.tsx            ← Crear producto
src/app/admin/products/edit/[id]/page.tsx         ← Editar producto
src/app/admin/orders/page.tsx                     ← Gestión de órdenes
src/components/forms/ProductForm.tsx              ← Form reutilizable create/edit
src/components/ui/Modal.tsx                       ← Modal de confirmación
src/services/admin-product.service.ts             ← CRUD productos admin
src/services/admin-order.service.ts               ← Gestión órdenes admin
src/models/product.model.ts (CreateProductRequest) ← Interfaz de creación
```

#### Qué debe demostrar en la defensa

1. **Dashboard Admin:**
   - Protegido con `AdminGuard`
   - Stats reales cargadas del backend:
     - Total de productos (de `AdminProductService.getAll()`)
     - Total de órdenes (de `AdminOrderService.getAll()`)
     - Órdenes pendientes (filtrar por status PLACED/PENDING)
   - Cards con iconos y animaciones
   - Links rápidos a "Productos" y "Órdenes"

2. **Gestión de Productos:**
   - Tabla con columnas: Imagen, Título, Marca, Precio, Stock, Categoría, Acciones
   - Datos cargados de `AdminProductService.getAll()` → `GET /products`
   - Búsqueda client-side por título o marca
   - Botón editar → navega a `/admin/products/edit/{id}`
   - Botón eliminar → abre Modal de confirmación → `AdminProductService.delete()`
   - Auto-refresh al volver a la página (listener `focus`)
   - Botón "Nuevo Producto" → navega a `/admin/products/create`

3. **Crear Producto:**
   - Usa `ProductForm` con `mode="create"`
   - Al submit: `AdminProductService.create(data)` → `POST /admin/products/`
   - Mensaje de éxito → `router.refresh()` → redirect a `/admin/products`
   - Manejo de errores

4. **Editar Producto:**
   - Extrae ID de `useParams()`
   - Al montar: `AdminProductService.getById(id)` → `GET /products/{id}`
   - Usa `ProductForm` con `mode="edit"` y `initialData={product}`
   - Al submit: `AdminProductService.update(id, data)` → `PUT /admin/products/{id}/update`
   - Mensaje de éxito → redirect

5. **ProductForm (componente clave):**
   - Formulario reutilizable para create y edit
   - Campos: título, descripción, marca, color, precio regular, precio con descuento, descuento % (auto-calculado), cantidad en stock, URL imagen
   - Sección de categorización: topLevel, secondLevel, thirdLevel
   - Sección de tallas dinámica: agregar/quitar pares `{name, quantity}`
   - Validaciones: campos requeridos, precio > 0, URL válida
   - Lazy initialization con `useState(() => ...)` para modo edición
   - `useEffect` para sincronizar cuando `initialData` cambia

6. **Gestión de Órdenes:**
   - Tabla con: OrderId, Cliente, Fecha, Estado (badge con colores), Total, Acciones
   - Datos de `AdminOrderService.getAll()` → `GET /admin/orders/`
   - Filtro por estado (select)
   - Búsqueda por email del cliente
   - Acciones por fila según estado actual:
     - PLACED → botón "Confirmar" → `AdminOrderService.confirm()`
     - CONFIRMED → botón "Enviar" → `AdminOrderService.ship()`
     - SHIPPED → botón "Entregar" → `AdminOrderService.deliver()`
     - No DELIVERED/CANCELLED → botón "Cancelar" → `AdminOrderService.cancel()`
     - Siempre → botón "Eliminar" → Modal → `AdminOrderService.delete()`
   - Refresh automático después de cada acción

7. **Modal Component:**
   - Overlay semitransparente
   - Card centrada con título, mensaje, botones
   - Variante `danger` para eliminaciones
   - Soporte para loading state
   - Cierre con Escape o clic fuera

#### Preguntas que le pueden hacer

- ¿Cómo protegen las rutas admin?
- ¿Cómo funciona el ProductForm en modo create vs edit?
- ¿Por qué usan `router.refresh()` después de crear/actualizar?
- ¿Cómo calculan el descuento automáticamente?
- ¿Cómo manejan las tallas dinámicamente?
- ¿Qué pasa si el backend no actualiza correctamente? (hablar de los bugs B1-B8 que se reportaron)
- ¿Cómo funciona el auto-refresh al volver a la página?
- ¿Por qué el Modal es un componente separado?

---

## Qué demostrar en vivo cada persona

| Persona | Demo en vivo |
|---------|-------------|
| **C** | 1. Abrir app sin sesión → 2. Ir a /login → 3. Ingresar credenciales → 4. Mostrar token en DevTools → 5. Ir a /register → 6. Crear usuario nuevo → 7. Login con el nuevo usuario |
| **D** | 1. Mostrar Navbar responsive (resize) → 2. Links condicionales según rol → 3. Ir a /profile → 4. Mostrar datos del usuario → 5. Intentar ir a /admin sin ser admin → 6. Mostrar proxy en DevTools Network |
| **A** | 1. Abrir Home → 2. Ver productos destacados → 3. Ir a /products → 4. Aplicar filtros → 5. Buscar producto → 6. Paginar resultados → 7. Mostrar loading state |
| **B** | 1. Clic en producto → 2. Ver detalle completo → 3. Ver tallas disponibles → 4. Volver y usar filtros avanzados → 5. Mostrar ProductFilter en mobile (drawer) |
| **E** | 1. Login como admin → 2. Ir a /admin → 3. Ver stats reales → 4. Ir a productos → 5. Crear producto nuevo → 6. Editar producto existente → 7. Eliminar producto → 8. Ir a órdenes → 9. Confirmar/Enviar orden |

---

## Resumen Rápido para Memorizar

```
PERSONA A → "Yo hice la tienda": Home + Catálogo con filtros y búsqueda
PERSONA B → "Yo hice el detalle": Vista de producto individual + Filtros visuales
PERSONA C → "Yo hice la seguridad": Login + Register + JWT + AuthContext
PERSONA D → "Yo hice la estructura": Navbar + Layout + Perfil + Guards + Proxy
PERSONA E → "Yo hice el admin": Dashboard + CRUD Productos + Órdenes Admin
```