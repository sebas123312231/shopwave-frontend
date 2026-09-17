# Executive Summary

## Alcance y método

Auditoría realizada el 2026-09-16 sobre el estado presente de `shopwave-frontend`. La revisión fue exclusivamente de lectura: no se modificó código, configuración, README ni dependencias; no se hicieron commits, push, PRs ni deploys. El único archivo creado por esta auditoría es este reporte.

Se revisaron los 78 archivos de código fuente de `src/` (7.233 líneas), configuración, `package-lock.json`, colección Postman, documentación local y la documentación de Next.js 16 instalada en `node_modules/next/dist/docs/`. También se ejecutaron los scripts existentes de lint, build y start sin instalar nada.

Leyenda:

- **Verificado en código**: conclusión sustentada directamente por el repositorio.
- **Verificado en ejecución**: observado mediante un comando ejecutado localmente.
- **NO VERIFICADO**: depende del backend, del navegador real, de datos o de un entorno que no estuvo disponible.

## Diagnóstico ejecutivo

ShopWave Fusion es un e-commerce universitario con una amplitud funcional considerable para un proyecto académico: catálogo, búsqueda, filtros, carrito por talla, checkout, órdenes, perfil y panel administrativo. La base demuestra React, App Router, TypeScript, Tailwind, Context y consumo de REST.

El proyecto **compila y tiene routing funcional**, pero no está cerca de ser una pieza fuerte de portfolio profesional sin un rework importante. La mayor parte de la aplicación es Client Component y carga datos después de hidratar; el acceso se protege principalmente con guards del navegador; el token vive en `localStorage`; el checkout maneja números completos de tarjeta; no existen tests automatizados; hay varios flujos frágiles o inconsistentes y varias superficies visuales que son sólo simulaciones.

### Estado general

**Prototipo académico funcional en amplitud, con deuda técnica alta y madurez profesional débil.**

### Principal fortaleza

La cobertura de dominio y de flujos: el repositorio contiene un recorrido de compra completo y un área admin real, organizado en servicios, modelos, contextos y componentes reutilizables.

### Principal debilidad

La distancia entre “funciona en el happy path” y “es confiable, seguro, accesible y demostrable en producción”: no hay pruebas, el backend no pudo responder durante la auditoría, el manejo de estados de error es incompleto y el checkout transmite/mantiene datos de tarjeta completos.

### Valor para portfolio hoy

- **Front-End Junior React: ACEPTABLE**, como evidencia de haber construido una app React amplia; no como demostración de calidad profesional alta.
- **Full Stack Developer: DÉBIL**, porque no existe backend en este repositorio y la integración externa no pudo verificarse en vivo.
- **React/Next/TypeScript: ACEPTABLE**, con TypeScript estricto y App Router real, pero con uso limitado de capacidades de Next y una estrategia casi totalmente client-side.
- **UI/UX: DÉBIL**, por la apariencia de plantilla académica, superficies falsas/incompletas, inconsistencias y problemas de accesibilidad.
- **REST: ACEPTABLE**, por la capa de servicios y la cantidad de operaciones, con contrato y errores de integración sin demostrar.
- **Ingeniería de software: DÉBIL**, principalmente por ausencia total de tests, validación runtime, controles de seguridad de frontend y lógica duplicada.

# Estado actual del producto

## Qué aplicación es

Una tienda online orientada a un contexto universitario. El usuario anónimo puede descubrir productos; el usuario autenticado puede añadir variantes por talla al carrito, realizar checkout, consultar órdenes y ver su perfil; el administrador puede gestionar productos y estados de órdenes.

## Problema que intenta resolver

Ofrecer un catálogo de productos con descubrimiento por búsqueda/filtros y completar una compra autenticada con dirección, forma de pago y seguimiento de órdenes. El panel admin cubre operaciones básicas de inventario y pedidos.

## Rutas existentes

El build de Next 16 generó estas rutas de aplicación:

| Ruta | Tipo en build | Función observada |
|---|---:|---|
| `/` | Estática | Home, hero, productos destacados y footer |
| `/products` | Estática | Catálogo, búsqueda, filtros y paginación client-side |
| `/products/[id]` | Dinámica | Detalle, tallas, stock y carrito |
| `/login` | Estática | Login mediante `AuthScreen` |
| `/register` | Estática | Registro mediante `AuthScreen` |
| `/cart` | Estática | Carrito protegido por `AuthGuard` |
| `/checkout` | Estática | Checkout de tres pasos protegido |
| `/orders` | Estática | Órdenes del usuario con polling |
| `/orders/[id]` | Dinámica | Detalle de orden con polling hasta estado terminal |
| `/profile` | Estática | Perfil, direcciones y tarjetas enmascaradas visualmente |
| `/admin` | Estática | Dashboard de administración |
| `/admin/products` | Estática | Listado, búsqueda y borrado de productos |
| `/admin/products/create` | Estática | Alta de producto |
| `/admin/products/edit/[id]` | Dinámica | Edición de producto |
| `/admin/orders` | Estática | Listado, filtro, transiciones de estado y borrado |
| `/admin/orders/[id]` | Dinámica | Detalle de orden para admin |
| `/icon.svg` | Estática | App icon de App Router |

No existe carpeta `pages/`. No existen route handlers del frontend, `proxy.ts`, middleware, layouts segmentados, `loading.tsx`, `error.tsx`, `not-found.tsx` ni `global-error.tsx` personalizados. Next genera sus fallbacks internos (`/_not-found` y `/_global-error`).

## Flujos de usuario

### Usuario anónimo

1. Entra a `/`.
2. Ve productos destacados y navega a `/products`.
3. Busca, filtra, ordena y pagina productos.
4. Abre `/products/[id]`.
5. Si intenta comprar, recibe un botón que lo lleva a `/login?redirect=...`.

### Registro y login

1. Registro con nombre, apellido, email, teléfono y contraseña.
2. `POST /auth/signup`.
3. Tras éxito se muestra un mensaje y, después de dos segundos, se cambia a la vista de login.
4. El código **no inicia sesión automáticamente**, aunque algunos textos/documentos lo sugieren.
5. Login con `GET /auth/signin` y Basic Auth.
6. El JWT se guarda en `localStorage`; luego se recarga la página y se redirige al destino o a `/`.

### Compra

1. Producto: selección de talla y cantidad limitada por stock de talla y máximo 10.
2. Carrito: actualización optimista de cantidad, eliminación con modal y resumen.
3. Checkout paso 1: dirección guardada o nueva.
4. Checkout paso 2: método de pago y tarjeta guardada/nueva.
5. Checkout paso 3: confirmación visual tras `POST /orders/`.
6. Se refresca el carrito después de crear la orden.

La ejecución completa contra el backend es **NO VERIFICADA**: la URL configurada no respondió a `GET /products` durante la auditoría.

### Post-compra

- `/orders` consulta las órdenes y hace polling cada tres segundos mientras la pestaña está visible.
- `/orders/[id]` hace polling mientras el estado no sea `DELIVERED` o `CANCELLED`.
- La lista no ordena localmente las órdenes; depende del orden que entregue el backend.

### Administración

- Dashboard con conteo de productos, conteo de órdenes, ingresos del mes y órdenes pendientes.
- CRUD parcial de productos: listar, buscar, crear, editar y borrar.
- Gestión de órdenes: listar, filtrar por estado, confirmar, enviar, entregar, cancelar, ver detalle y borrar.
- Los endpoints admin y la autorización real del backend son **NO VERIFICADOS**.

## Funcionalidades completas, incompletas y abandonadas

### Implementadas en código

- Catálogo y detalle de productos.
- Búsqueda, filtros por categoría/color/talla/precio/descuento/stock y ordenamiento.
- Persistencia de filtros en `sessionStorage` y query string.
- Tema claro/oscuro.
- Registro y login.
- Carrito con variantes por talla.
- Checkout con libreta de direcciones y tarjetas.
- Órdenes y detalle.
- Polling de órdenes.
- Perfil de usuario.
- CRUD básico de productos admin.
- Cambios de estado de órdenes admin.
- Estados loading/error/empty en varias vistas.

### Incompletas o inconsistentes

- Registro: no hace auto-login pese al texto `Iniciando...` y a la documentación de exposición.
- Newsletter del footer: input y botón sin estado ni request.
- Redes sociales, ayuda, términos, privacidad, contacto y cookies: son `span` visuales sin navegación.
- Perfil: sólo lectura; no edita datos, direcciones ni pagos.
- Reviews/ratings: existe el componente y servicios, pero el detalle nunca monta `ProductReviews`; el usuario no tiene acceso a esa funcionalidad.
- Reset/retry de `/orders`: el botón “Reintentar” sólo activa un estado de loading; no vuelve a iniciar el fetch.
- Errores del carrito: las acciones pueden rechazar la promesa sin mostrar feedback específico al usuario.

### Frágiles o probablemente rotas

- Rutas dinámicas con `id` no numérico en órdenes/admin producto pueden quedar en loading indefinidamente porque hacen `return` sin cambiar `loading`.
- La selección de tarjeta guardada no queda visualmente seleccionada por una discrepancia entre la key calculada por `CheckoutPage` y la key comparada por `PaymentBook`.
- El endpoint y forma de paginación de productos del frontend no coinciden con lo documentado en la colección Postman.
- El parseo de respuestas exitosas presupone JSON; una respuesta 2xx de texto plano puede lanzar una excepción.
- El dashboard admin absorbe fallos independientes de productos/órdenes y puede presentar ceros como si fueran datos válidos.

### Abandonadas o no conectadas

- `src/components/products/ProductReviews.tsx`.
- `RatingService` y `ReviewService` sólo son consumidos por ese componente no montado.
- `ProductService.getByCategory()` no tiene consumidores.
- `AdminProductService.createMultiple()` no tiene consumidores.
- `src/types/form-state.type.ts` y `src/utils/validation.util.ts` no tienen consumidores.
- Los SVG de `public/` son assets de scaffold no usados por la aplicación.

# Stack verificado

## Dependencias instaladas y uso real

| Tecnología | Declarada | Resolución instalada | Uso real observado |
|---|---:|---:|---|
| Next.js | `16.2.6` | `16.2.6` | App Router, `next/navigation`, `next/font/google`, `next/script`, metadata |
| React | `19.2.4` | `19.2.4` | Hooks, JSX, Context, Client Components |
| React DOM | `19.2.4` | `19.2.4` | Runtime React |
| TypeScript | `^5` | `5.9.3` | Todo el código fuente está en `.ts/.tsx`; `strict: true` |
| Tailwind CSS | `^4` | `4.3.0` | `@import "tailwindcss"`, clases utilitarias, `@theme` |
| `@tailwindcss/postcss` | `^4` | `4.3.0` | Plugin PostCSS activo |
| `lucide-react` | `^1.16.0` | `1.16.0` | Iconos de navegación y UI |
| `jwt-decode` | `^4.0.0` | `4.0.0` | Decodificación local y expiración del JWT |
| ESLint | `^9` | `9.39.4` | Lint con `eslint-config-next` |
| `eslint-config-next` | `16.2.6` | `16.2.6` | Reglas Next Core Web Vitals y TypeScript |

## Tecnologías declaradas pero no realmente disponibles/activas

- No hay Redux, Zustand, TanStack Query, SWR ni otra librería de estado servidor.
- No hay React Hook Form, Formik, Zod, Yup ni validación de esquema runtime.
- No hay Axios; se usa `fetch` nativo.
- No hay NextAuth/Auth.js ni cookies de sesión.
- No hay `next/image`; todas las imágenes se pintan con `<img>`.
- No hay biblioteca de UI externa; los componentes UI son propios y Tailwind puro.
- No hay Jest, Vitest, Playwright, Cypress, Testing Library ni framework de cobertura.
- No hay Prettier configurado ni dependencia instalada.
- Hay `.stylelintrc.json`, pero no hay `stylelint`, `postcss-lit` ni script para ejecutarlo.

## Estado de runtime y configuración

- Node observado: `v24.11.0`.
- npm observado: `11.19.0`.
- Next 16.2.6 declara engine `>=20.9.0`; la versión local cumple y el build pasa.
- `tsconfig.json`: `strict: true`, `noEmit: true`, alias `@/* -> ./src/*`, `skipLibCheck: true`, `allowJs: true`, `incremental: true`.
- `next.config.ts`: sólo `skipTrailingSlashRedirect: true`.
- `vercel.json`: framework Next.js, build `npm run build`, install `npm install`, `cleanUrls: true`, `trailingSlash: false`, región `iad1`.
- `.env.local` está ignorado por Git y contiene la variable `NEXT_PUBLIC_API_URL`; no se imprimió su valor.
- `BACKEND_URL` aparece en README/documentación, pero no es leída por el código fuente actual.
- El árbol instalado contiene tres paquetes extraneous según `npm ls`: `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime` y `@tybys/wasm-util`. Esto describe el entorno `node_modules` presente, no una modificación realizada durante la auditoría.

# Arquitectura

## Organización

```text
src/app/          rutas App Router y páginas de dominio
src/components/   UI por dominio y componentes base
src/context/      Auth, carrito y tema
src/guards/       AuthGuard y AdminGuard
src/hooks/        aliases de contextos y useProducts
src/models/       modelos de dominio y requests
src/services/     wrappers de endpoints REST
src/types/        tipos genéricos y roles
src/utils/        moneda, fechas, token y validaciones pequeñas
public/           SVG de scaffold sin uso detectado
```

La separación por carpetas es clara para un proyecto pequeño. El problema no es la ausencia de capas, sino que varias capas son delgadas mientras páginas y componentes concentran demasiada lógica de fetching, validación, estado y presentación.

## Puntos sólidos

- App Router correcto, con rutas dinámicas reconocibles.
- Alias de imports consistente en la mayoría de los imports absolutos.
- Servicios independientes por dominio.
- Modelos TypeScript centralizados.
- Contextos separados para autenticación, carrito y tema.
- Componentes de dominio reutilizados: `ProductCard`, `OrderDetailView`, `OrderStatusBadge`, `ProductForm`, `Button`, `Input`, `Select`, `Modal`, `Spinner`.
- `CartContext` incluye actualización optimista y recálculo de totales.
- `useProducts` encapsula filtros, debounce, paginación, URL y `sessionStorage`.

## Problemas estructurales

- Los providers globales están en el root layout y arrastran estado client-side a todas las rutas.
- No hay layouts por área de tienda/admin ni fronteras de error/loading por segmento.
- Cada página protegida instancia su propio guard; no hay una frontera de acceso común de routing.
- Las páginas contienen llamadas de servicio y reglas de negocio junto al JSX.
- No hay una capa de DTO/adaptador que normalice respuestas del backend.
- La API está acoplada a un singleton `api` con `process.env` leído al cargar el módulo y a APIs del navegador (`window`, `localStorage`).
- La convención de nombres es inconsistente: `cartItemRow.tsx`/`cartSummary.tsx` frente a PascalCase del resto.
- Las mismas decisiones de moneda, estados, errores, badges y layouts se repiten en diferentes archivos.
- No existe una estrategia observable de mock, contrato o test para los servicios.

## Archivos excesivamente grandes

Los principales concentradores de responsabilidades son:

1. `src/components/products/ProductFilter.tsx` — 430 líneas.
2. `src/app/checkout/page.tsx` — 410 líneas.
3. `src/components/forms/ProductForm.tsx` — 409 líneas.
4. `src/app/admin/orders/page.tsx` — 277 líneas.
5. `src/components/products/ProductDetail.tsx` — 259 líneas.
6. `src/components/auth/AuthScreen.tsx` — 238 líneas.
7. `src/hooks/useProducts.ts` — 236 líneas.
8. `src/app/admin/page.tsx` — 221 líneas.
9. `src/app/admin/products/page.tsx` — 217 líneas.
10. `src/components/layout/Sidebar.tsx` — 206 líneas.

# Funcionalidades existentes

## Catálogo

El catálogo muestra tarjetas con imagen, marca, título, precio, descuento y enlace al detalle. `useProducts` soporta búsqueda con debounce de 400 ms, filtros persistidos, query string, paginación local y estados de carga/error.

La implementación actual descarga el array de productos completo con `GET /products` para filtrar, ordenar y paginar en el navegador. Esto es funcional para un dataset pequeño, pero no es paginación REST real ni escala con el tamaño del catálogo.

## Detalle y carrito

`ProductDetail` calcula stock por talla, limita cantidad y detecta si la variante está en carrito. El carrito muestra imagen, talla, cantidad, precio, descuento y eliminación confirmada.

Fortalezas: el límite se calcula por talla, se permite la misma prenda en distintas tallas y existe actualización optimista.

Debilidades: los errores de `addItem`, `removeItem` y `updateItem` no llegan a un mensaje visible específico; el botón queda controlado sólo por estados locales; la autoridad final de stock depende del backend y no se pudo verificar.

## Checkout

La secuencia de dirección, pago y confirmación está bien delimitada y tiene validaciones client-side para campos requeridos, teléfono y longitud de tarjeta. La dirección guardada se selecciona por ID y la tarjeta se prellena desde el perfil.

Problemas observados:

- Se construye `paymentId` como `pay-${Date.now()}`; no hay integración de pago real.
- Se manda el número completo de tarjeta dentro del payload de orden.
- `PaymentBook` construye una key con índice, mientras `CheckoutPage` guarda una key sin índice; la tarjeta elegida se puede prellenar, pero no queda marcada como seleccionada.
- El perfil se solicita al montar la página incluso antes de que `AuthGuard` haya confirmado acceso.
- El error de perfil se silencia y el usuario sólo ve un formulario manual.

## Órdenes y admin

La cobertura de estados es amplia y el polling tiene control de visibilidad de pestaña. El admin tiene acciones y confirmaciones para borrado.

La cancelación de órdenes se ejecuta sin un modal de confirmación, a diferencia del borrado. El detalle admin usa `GET /orders/:id`, no un endpoint admin explícito. La lista de usuario no ordena los resultados por fecha.

# UI/UX

## Aspectos positivos

- Sistema visual reconocible basado en variables CSS: superficies, foreground, bordes, éxito, warning y error.
- Tipografía Geist cargada desde `next/font/google`.
- Consistencia razonable de cards redondeadas, bordes, sombras y badges.
- Hay estados vacíos explícitos para carrito, órdenes, productos y reviews.
- Hay feedback de carga en bastantes vistas y mensajes de éxito en alta/edición/checkout.
- Los controles principales tienen estados hover, disabled y algunos focus rings.
- El tema oscuro usa variables, no sólo una clase de fondo aislada.
- La copia de producto está localizada al español y los precios usan `es-BO`/BOB.

## Aspectos que lo hacen parecer universitario o poco profesional

- El hero utiliza una imagen externa de un dominio de imágenes/IA, hardcodeada en `src/app/page.tsx`, sin asset de marca propio ni garantía de disponibilidad.
- `public/` conserva los SVG de scaffold de Next/Vercel/globe/window, aunque no se usan; transmite falta de limpieza de entrega.
- El footer presenta redes sociales como letras (`X`, `In`, `Ig`, `Gh`) dentro de `span`, no como enlaces funcionales.
- Newsletter, ayuda, términos, privacidad, contacto y cookies son affordances visuales sin destino ni comportamiento.
- El footer sólo aparece en la home; el resto de la aplicación no tiene una estructura global equivalente.
- El carrusel/marquee y las animaciones agregan una apariencia de plantilla sin resolver los estados de producto/branding.
- Hay varias implementaciones visuales repetidas en vez de un sistema de componentes más uniforme.
- Los errores muestran mensajes directos del backend, que pueden ser técnicos o poco orientados al usuario.
- No hay una página 404 de producto/orden con la identidad visual de la aplicación.
- El detalle de producto no incluye reviews aunque existe un componente preparado; la promesa de producto queda incompleta.

## Componentes visuales concretos

- **Cards**: `ProductCard` y `OrderCard` son reutilizables y claros; el precio usa formato local. Las imágenes no tienen dimensiones intrínsecas ni fallback visible.
- **Formularios**: `Input`/`Select` reducen duplicación, pero no siempre reciben `name`/`id`; las validaciones están repartidas entre navegador y handlers manuales.
- **Tablas**: admin usa `overflow-x-auto` y oculta columnas por breakpoint. Es razonable para desktop, pero no ofrece una alternativa móvil más legible.
- **Modal**: tiene Escape, bloqueo de scroll y cierre por overlay, pero no es un diálogo accesible completo ni maneja foco.
- **Drawer de filtros**: tiene `role="dialog"` y Escape, pero no focus trap ni inert/hidden efectivo cuando está cerrado.
- **Loading**: se usa spinner genérico; no hay skeletons ni `loading.tsx` de Next.
- **Empty/Error**: existe cobertura razonable, pero no es uniforme y hay catches silenciosos.

## Dark mode

Está implementado con `ThemeContext`, `localStorage` y un script `beforeInteractive` en `src/app/layout.tsx`. Es una fortaleza real, aunque:

- El default es claro y no se consulta `prefers-color-scheme`.
- Hay clases `white/*` y colores hardcodeados que no forman parte de los tokens.
- El CSS aplica transiciones a todos los elementos (`html *`), lo que puede provocar animaciones inesperadas y coste innecesario.
- Sólo el marquee respeta `prefers-reduced-motion`; las demás animaciones no se desactivan.
- La clase dinámica `bg-${stat.color}/10` del dashboard admin puede dejar estilos incompletos según el escaneo de Tailwind.

## Verificación visual

Se levantó el servidor de producción local y todas las rutas respondieron HTTP 200. No se realizó una inspección visual manual con interacción de navegador ni una captura comparativa. Por tanto, la calidad pixel-level, el contraste medido y los estados después de respuesta real del backend son **NO VERIFICADOS**.

# Responsive

| Zona | Evidencia estática | Evaluación |
|---|---|---|
| Sidebar | Header móvil fijo, drawer lateral, `md:translate-x-0`, nav con scroll | Base correcta; focus trap y estados accesibles faltantes |
| Catálogo | Grid 1/2/3/4 columnas en `sm/lg/xl` | Probablemente estable para tarjetas cortas |
| Filtros | Drawer `w-full max-w-sm`, body scrollable, inputs de precio | Buena intención; teclado/foco y rangos extremos requieren prueba manual |
| Detalle | Dos columnas desde `lg`, acciones apiladas en móvil | Imagen sin dimensiones/fallback; altura y crop requieren prueba |
| Carrito | Row vertical en móvil, grid de 12 columnas desde `sm` | El precio por item se oculta en móvil; necesita prueba de lectura completa |
| Checkout | Formularios 1 columna/2 columnas, pasos con labels ocultos bajo `sm` | Estructura razonable; tarjetas/pasos deben probarse en viewport estrecho |
| ProductForm | Grids pasan a una columna; bloque de tallas usa `flex` sin wrap | Frágil: nombre, cantidad y botón pueden comprimirse en móvil |
| Admin tablas | `overflow-x-auto`, columnas ocultas en `md/lg` | Funciona como fallback de overflow, no como UX móvil optimizada |
| Auth | Paneles absolutos, `h-full`, outer `overflow-hidden` | Alto riesgo de clipping en móviles con el formulario de registro largo |
| Modales | `max-w-md`, padding responsive básico | Falta validar teclado, zoom y contenido largo |
| Botones táctiles | Muchos botones grandes, pero icon-only admin y toggle de 32 px | Algunos controles quedan por debajo de un target táctil cómodo |
| Texto largo | Títulos truncados en cards; errores y descripciones no siempre limitados | Riesgo de saltos, overflow o cards de altura irregular |

El comportamiento real en mobile, tablet y desktop es **NO VERIFICADO** porque no se ejecutó una matriz de viewports en navegador.

# Componentes

## Reutilización buena

- `Button`: variantes, tamaños, estado loading y disabled.
- `Input` y `Select`: wrappers con label/error.
- `Badge`: mapa de variantes.
- `Spinner`: tamaño y `role="status"`.
- `Modal`: reutilizado para productos y órdenes.
- `ProductCard`, `ProductList`, `FeaturedMarquee`.
- `OrderCard`, `OrderList`, `OrderDetailView`, `OrderStatusBadge`.
- `ProductForm` compartido entre create/edit.
- `AddressBook`, `PaymentBook`, `AddressForm`, `CheckoutForm`.

## Componentes grandes o con demasiadas responsabilidades

- `ProductFilter`: estado del drawer, sincronización de filtros, sliders, colores, tallas, sort y UI completa.
- `ProductForm`: estado, normalización, validación, cálculo de descuentos, tallas, preview de imagen y layout.
- `ProductDetail`: stock, carrito, autenticación, redirección, quantity selector y presentación.
- `AuthScreen`: dos formularios, navegación manual de URL, transición visual, login, registro y feedback.
- `checkout/page.tsx`: perfil, address book, payment book, validaciones, payload y 3 estados de pantalla.
- `admin/orders/page.tsx`: fetching, sort, filtro, mutaciones de estado, delete modal y tabla.
- `Sidebar`: navegación, permisos de UI, logout, responsive drawer, usuario y tema.

## Duplicación e inconsistencias

- `Intl.NumberFormat('es-BO', BOB)` se repite en varios componentes pese a existir `formatPrice`.
- Mapas de estados y labels de órdenes se repiten en `OrderStatusBadge`, admin dashboard y admin orders.
- Tarjetas de error, empty states y wrappers de loading se repiten con ligeras variaciones.
- Icon-only admin buttons tienen `title`, pero no un `aria-label` explícito.
- Convenciones de nombres de archivo mixtas.
- `ProductReviews` usa una interfaz propia de props y modelos que no están integrados con `ProductDetail`.

# State Management

## Mapa actual

| Estado | Ubicación | Valor | Riesgos observados |
|---|---|---|---|
| Sesión | `AuthContext` | Expiración, email, role, logout y evento global 401 | Confía en claims decodificados en cliente; sólo guard de UX |
| Carrito | `CartContext` | Carga, error, add/update/remove, refresh | Refetch duplicado, errores silenciosos, timeout sin cancelación |
| Tema | `ThemeContext` | Light/dark y persistencia | Script + effect duplican responsabilidad; transiciones globales |
| Catálogo | `useProducts` | Filtros, búsqueda debounce, data, loading/error | Requests no cancelados ni versionados; responses stale pueden ganar |
| Checkout | `checkout/page.tsx` | Step, profile, address/payment data y errores | Página demasiado grande; sensitive state de tarjeta en memoria y request |
| Órdenes | páginas `/orders` | Estado local + polling | Retry defectuoso; polling duplicado y sin abort |
| Admin | páginas admin | Estados locales por pantalla | Mucha lógica repetida y error handling desigual |

## Anti-patterns concretos

1. `useProducts` lanza un fetch nuevo por filtros/búsqueda sin `AbortController` ni request id. Una respuesta lenta anterior puede sobrescribir la nueva.
2. `serializedFilters` es derivado de `filters`, pero también `fetchProducts` ya depende de `filters`; el effect tiene dependencia redundante.
3. `CartPage` llama `refreshCart()` al montar aunque el `CartContext` ya refresca al detectar autenticación; puede generar requests duplicados.
4. `CartContext` hace updates optimistas, pero la UI que invoca `updateItem`/`removeItem` no muestra el error si el rollback/refetch falla.
5. El timeout de 60 s sólo cambia estados; no cancela el fetch. Una respuesta tardía puede volver a cambiar `cart` y borrar el error.
6. `/orders` define `handleRetry` sin llamar a `OrderService.getUserOrders`; el retry no reintenta realmente.
7. `/orders/[id]` reejecuta el fetch inicial cuando cambia `isTerminal`; además mantiene una función `fetchDetail` separada de la lógica inicial.
8. `if (!orderId) return` en detalles de orden/admin deja `loading` en `true` para IDs inválidos.
9. La página de checkout obtiene el perfil y la de perfil obtiene datos antes de que el guard termine de resolver la autenticación.
10. `AuthContext` usa `decodeToken(token) as unknown as JwtPayload`, ocultando que no hay validación runtime de la forma del JWT.

No hay cache compartida de servidor ni librería de sincronización de datos; cada página decide cuándo pedir/refrescar.

# API Integration

## Cliente API

`src/services/api.service.ts` centraliza `GET`, `POST`, `PUT`, `DELETE` y login Basic. Usa `NEXT_PUBLIC_API_URL`, agrega `Content-Type`, añade el token raw en `Authorization` cuando se requiere y usa `cache: 'no-store'` sólo para GET.

### Fortalezas

- Un único punto de entrada para requests.
- Diferencia pública/protegida mediante `requireAuth`.
- Manejo explícito de 401 y evento `auth:unauthorized`.
- Normalización de prefijo `Bearer` al guardar/leer el token.
- Mensaje claro si falta `NEXT_PUBLIC_API_URL`.

### Debilidades

- No hay `AbortController`, timeout HTTP general ni retry/backoff.
- No hay validación runtime de respuestas.
- Los genéricos de `api.get<T>` son casts; no comprueban que el backend responda `T`.
- `ApiResponse<T>` existe, pero el cliente no desenvuelve una envoltura `{ message, status, data }`; los servicios mezclan respuestas directas y `ApiResponse`.
- `handleResponse` usa `response.json()` para errores y pierde cuerpos de error no JSON.
- `parseJsonSafe` contiene una heurística no estándar para encontrar JSON dentro del texto y puede fallar ante respuestas 2xx de texto plano.
- El servicio depende de `window` al procesar ciertos 401, por lo que no es neutral para Server Components.
- Login usa `GET` con Basic Auth y no fuerza `cache: 'no-store'` en esa llamada.
- La URL base se captura al cargar el módulo; no hay cliente inyectable para tests/mocks.

## Endpoints usados

| Dominio | Método y ruta en código | Auth indicada | Estado de integración |
|---|---|---:|---|
| Auth | `POST /auth/signup` | No | Código presente; backend **NO VERIFICADO** |
| Auth | `GET /auth/signin` | Basic | Código presente; backend **NO VERIFICADO** |
| Productos | `GET /products` | No | Usado para home, catálogo, facets y admin |
| Productos | `GET /products/:id` | No | Usado en detalle/edit |
| Productos | `GET /products/products/search?q=...` | No | Usado para búsqueda |
| Productos | `GET /products/by-category?...` | No | Servicio sin consumidor |
| Carrito | `GET /cart/` | JWT | Usado; contrato con Postman difiere |
| Carrito | `PUT /cart/add` | JWT | Usado |
| Carrito | `PUT/DELETE /cart_items/:id` | JWT | Usado |
| Órdenes | `POST /orders/` | JWT | Usado; contrato con Postman difiere |
| Órdenes | `GET /orders/user`, `GET /orders/:id` | JWT | Usado |
| Usuario | `GET /users/profile` | JWT | Usado |
| Reviews | `GET /reviews/product/:id`, `POST /reviews/create` | JWT | Código huérfano; Postman marca lectura pública |
| Ratings | `GET /ratings/product/:id`, `POST /ratings/create` | JWT | Código huérfano; Postman marca lectura pública |
| Admin productos | `POST/PUT/DELETE /admin/products...` | JWT | Usado por admin; backend **NO VERIFICADO** |
| Admin órdenes | `GET/PUT/DELETE /admin/orders...` | JWT | Usado por admin; backend **NO VERIFICADO** |

## Drift de contrato

La colección `ShopWave.postman_collection.json` documenta, entre otros:

- `GET /products?page=0&size=8` para listado.
- `GET /products/all?pageNumber=0&pageSize=12&minDiscount=0` para filtros.
- `GET /cart` y `POST /orders` sin slash final.

El frontend actual hace `GET /products` sin query y filtra/pagina localmente, `GET /cart/` y `POST /orders/`. `README.md`, `README_MIGRACION_VERCEL.md`, Postman y `PLAN_CORRECCIONES.md` no representan un único contrato consistente. Como el backend no respondió durante la auditoría, no se puede afirmar cuál fuente está actualizada: este punto queda **NO VERIFICADO** y es un riesgo de integración real.

## Facilidad de sustituir o mockear el backend

**Aceptable con esfuerzo moderado**, no excelente. Los servicios están separados y tienen firmas tipadas, lo que ayuda a sustituirlos conceptualmente. Sin embargo, el `api` es singleton, la URL es global, las respuestas no tienen schemas/adapters y no existe infraestructura de mocks ni tests. Las páginas importan servicios concretos directamente y el estado depende de efectos, por lo que un mock simple de módulo sería posible, pero no hay evidencia automatizada de que funcione.

# Authentication & Security

## Qué existe realmente

- Login con Basic Auth construido en el navegador (`btoa(email:password)`).
- JWT guardado en `localStorage` bajo `shopwave_token`.
- Expiración comprobada localmente con `jwt-decode`.
- Role derivado de `authorities` del token.
- `AuthGuard` para usuario y `AdminGuard` para admin.
- Header `Authorization` con el token sin prefijo, según el contrato descrito por el proyecto.
- Evento global para reaccionar a 401.

## Seguridad real frente a controles de UX

| Control | Naturaleza | Evaluación |
|---|---|---|
| `AuthGuard` | UX/client-side | Evita mostrar contenido normal a usuarios no autenticados, pero no protege el route server-side |
| `AdminGuard` | UX/client-side | Oculta/redirige según claims locales; no es autorización real |
| `requireAuth` en servicios | Transporte | Añade token, pero no garantiza permisos |
| Backend admin | Seguridad real esperada | **NO VERIFICADO**; debe ser la autoridad definitiva |
| Expiración JWT local | UX | Ayuda a cerrar sesión vencida, pero no valida firma |
| `localStorage` | Persistencia | Expuesto a cualquier XSS ejecutable en el origen |

## Hallazgos de alto riesgo

1. **Tarjeta completa**: `CreateOrderRequest`, `PaymentDetails`, `PaymentInformation` y checkout manejan números de tarjeta completos. El payload de orden los transmite al backend y el perfil recibe información de pagos. No hay tokenización, gateway ni evidencia de cumplimiento PCI. El enmascarado ocurre sólo al renderizar.
2. **JWT en localStorage**: un XSS exitoso podría leer y exfiltrar la sesión. No hay cookie HttpOnly ni defensa equivalente en el frontend.
3. **Guard de admin falsificable en cliente**: quien modifica el almacenamiento/token puede hacer que la UI se muestre como admin; los endpoints deben rechazarlo server-side. Esa defensa no pudo verificarse.
4. **Open redirect**: `AuthScreen` acepta cualquier `redirect` que empiece por `/`. El valor `//dominio-externo` también cumple esa condición y puede convertirse en navegación externa.
5. **Sin headers de seguridad visibles**: `next.config.ts` y `vercel.json` no declaran CSP, HSTS, `frame-ancestors`, `X-Content-Type-Options` u otros headers. Esto no prueba que el hosting no los agregue, pero en el repositorio no hay evidencia.
6. **Imágenes remotas**: URLs provenientes de producto/backend y un hero externo se cargan directamente desde terceros; hay dependencia de disponibilidad, privacidad y contenido remoto.
7. **Script inline**: el `dangerouslySetInnerHTML` del tema es constante y no incorpora entrada de usuario, por lo que no es un XSS observado; sí requiere una política CSP compatible.

`.env.local` está correctamente ignorado y su valor no se imprimió. No se encontraron secretos de entorno expuestos en el código auditado. El archivo no trackeado `docs/EXPOSICION_5_PARTES.md` contiene un ejemplo de credencial administrativa; no se reproduce aquí. Si ese archivo se agregara al repositorio, constituiría un riesgo de filtración de credenciales de ejemplo.

# TypeScript

## Aportes reales

- `strict: true` está activo y el build ejecuta TypeScript sin errores.
- Hay interfaces de dominio para producto, carrito, orden, usuario, auth y requests.
- `OrderStatus`, `PaymentMethod`, `PaymentStatus` y variantes UI reducen strings arbitrarios en varios puntos.
- Props de componentes y callbacks están tipadas.
- Se usan `unknown` en muchos catches en lugar de `any`.

## Debilidades

- No hay validación runtime de respuestas API ni JWT.
- `decodeToken(token) as unknown as JwtPayload` convierte una respuesta no comprobada en un modelo confiable.
- `api` hace `parseJsonSafe(text) as T`; el tipo no valida el JSON.
- Hay casts repetidos para `PaymentMethod`, `PaymentStatus`, `Record<string, unknown>` y eventos de imagen.
- `PaymentInformation.paymentMethod` es `string`, mientras otras zonas usan union `PaymentMethod`.
- `Role` usa `'USER' | 'ADMIN'`, pero el modelo de usuario usa `'ROLE_USER' | 'ROLE_ADMIN'`; hay dos convenciones.
- `Product` y `Cart` conservan typos de contrato (`discountPersent`, `discounte`) que contaminan todo el código.
- `AdminProductService.update` recibe `Partial<Product>`, pero el formulario entrega `CreateProductRequest` con campos `size`, `topLevelCategory`, etc.; el cast estructural permite enviar un shape cuya compatibilidad de API no está demostrada.
- `ApiResponse<T>` y `FormState<T>` no forman una estrategia coherente de respuestas/estado.
- `allowJs: true` no aporta valor visible porque no hay fuentes JS.
- `skipLibCheck: true` reduce ruido de dependencias, pero también oculta errores externos.

Conclusión TypeScript: **aporta valor real en compilación y modelos**, pero en los bordes críticos se usa como declaración optimista de datos, no como validación efectiva.

# Performance

## Hallazgos estáticos

- Las rutas operativas se ejecutan principalmente como Client Components; el catálogo, home, detalle, perfil, checkout, órdenes y admin hacen fetching en `useEffect`.
- No hay fetching en Server Components, streaming, `loading.tsx`, lazy loading de áreas ni cache de datos.
- `ProductService.getFilteredProducts()` descarga todos los productos en cada cambio de filtro y pagina localmente.
- `getFacets()` hace otra descarga completa inicial; catálogo puede iniciar requests redundantes.
- Search llama un endpoint y vuelve a paginar localmente; no existe cancelación al escribir rápidamente.
- `orders` y detalle de orden hacen polling cada 3 s; es simple y útil para una demo, pero escala mal con muchas pestañas/usuarios.
- `FeaturedMarquee` duplica listas para el loop y vuelve a duplicarlas en cada fila; con 8 productos renderiza muchas copias aunque el dataset sea pequeño.
- Se usan seis `<img>` operativos, todos sin `next/image`, sin width/height y sin placeholder/fallback estándar. ESLint reporta seis warnings `@next/next/no-img-element`.
- El `loading="lazy"` de `ProductCard` también afecta imágenes destacadas que pueden estar cerca del viewport inicial.
- No hay `memo`/virtualización; para 12 tarjetas no es grave, pero el grid se rerenderiza al cambiar filtros/estado global.
- El CSS aplica transiciones a todo `html *` y `will-change: transform` al marquee; el coste real no fue medido.

## Medición

No se ejecutaron Lighthouse, Web Vitals, profiling de React, bundle analyzer ni una prueba con dataset grande. Performance real: **NO VERIFICADA**.

# Accessibility

## Lo que está bien

- HTML semántico básico con `main`, `nav`, `header`, `section`, `footer`, `form`, `table`.
- `Input` y `Select` soportan labels cuando reciben `label`.
- Botones principales tienen foco visible en `Button`; muchos controles tienen `aria-label` o `aria-pressed`.
- Imágenes de producto tienen `alt` basado en el título.
- Spinner usa `role="status"` y `aria-label`.
- El drawer de filtros declara `role="dialog"` y `aria-modal`.
- Existe soporte parcial para `prefers-reduced-motion`.

## Problemas concretos

- `Modal` no declara `role="dialog"`, `aria-modal`, `aria-labelledby` ni `aria-describedby`; tampoco hace focus trap ni devuelve el foco al trigger.
- El drawer de filtros permanece en el DOM transformado fuera de pantalla cuando está cerrado y no declara `aria-hidden`/`inert`; puede ser alcanzable por teclado.
- Sidebar móvil tampoco gestiona `aria-expanded`, `aria-controls`, foco o inert del panel cerrado.
- Los icon-only buttons de productos y órdenes admin tienen `title`, pero no `aria-label` explícito.
- Los botones de estrellas de `ProductReviews` no tienen nombre accesible individual.
- En login, varios `Input` tienen label pero no `name`/`id`; `Input` deriva el id de `props.name`, que queda indefinido, por lo que la asociación label-control es deficiente.
- Labels de `ProductReviews` no usan `htmlFor` y el textarea no tiene id.
- Errores, éxito, cambios de estado y resultados de búsqueda no usan `aria-live` de forma consistente.
- Las tablas no tienen `caption`, `scope` en headers ni alternativa móvil semántica.
- La pantalla auth mantiene dos formularios/títulos en el DOM y oculta uno sólo con opacity/position/pointer-events; puede producir una jerarquía de headings duplicada para tecnologías asistivas.
- Contraste de `white/40`, `white/50` y algunos colores muted no fue medido. **NO VERIFICADO** por herramienta automática.
- El target táctil de algunos icon buttons y de `ThemeToggle` es menor que un objetivo cómodo.

No hay axe, Lighthouse, pruebas de teclado o screen reader en el repositorio. Auditoría a11y completa: **NO VERIFICADA**.

# Testing

## Estado exacto

- `package.json` sólo define `dev`, `build`, `start` y `lint`.
- No existe script `test`.
- No existen archivos `*.test.*` o `*.spec.*` detectados.
- No existen dependencias de Jest, Vitest, Testing Library, Playwright o Cypress.
- No existe coverage, CI o configuración de tests.
- `ShopWave.postman_collection.json` es una colección manual de endpoints; no es una suite automatizada del frontend.

## Zonas prioritarias para testear

1. Login, expiración, 401, logout y guards.
2. Redirección post-login y seguridad del query `redirect`.
3. Catálogo: debounce, filtros combinados, URL/sessionStorage, paginación y respuestas fuera de orden.
4. Carrito: stock por talla, update optimista, rollback y errores.
5. Checkout: address book, payment book, validaciones, rechazo de API y ausencia de datos sensibles.
6. Órdenes: retry, polling, visibilidad, estado terminal e IDs inválidos.
7. Admin: autorización real, CRUD de producto, transición de estados y errores parciales.
8. Componentes UI: modal, drawer, focus, teclado y estados disabled/loading.
9. Responsive y accesibilidad.
10. Contratos de respuestas de cada endpoint.

Actualmente todos esos puntos están **NO VERIFICADOS AUTOMÁTICAMENTE**.

# Technical Debt

## CRÍTICA

- Manejo de número completo de tarjeta en frontend, payload y modelo de perfil.
- Seguridad de sesión basada en JWT en `localStorage` y autorización visual client-side.
- Integración real con backend no reproducible en el entorno actual y sin tests de contrato.

## ALTA

- Ausencia total de tests automatizados y cobertura.
- Drift entre Postman, README, plan interno y rutas reales.
- Filtrado/paginación de todo el catálogo en el cliente.
- Requests sin cancelación, timeout general, retry ni protección contra respuestas stale.
- Errores de carrito sin feedback y retry de órdenes defectuoso.
- Open redirect en login.
- Componentes/páginas grandes con lógica mezclada.
- Reviews/ratings desconectadas del producto.
- Ausencia de error/loading/not-found boundaries de Next.

## MEDIA

- Duplicación de formatters, mappings de estado, cards de error y guards.
- `<img>` sin optimización, dimensiones ni fallback.
- Polling fijo de tres segundos.
- Modal/drawer sin gestión completa de foco.
- Clases Tailwind dinámicas en dashboard.
- Formulario admin con contrato de update no claro y duplicación de estado inicial/efect.
- Registro sin auto-login y superficies de footer no funcionales.
- Validación client-side repartida, sin schemas ni mensajes de campo consistentes.
- Datos de tarjeta guardada recibidos completos aunque sólo se muestran los últimos cuatro dígitos.

## BAJA

- Nombres de archivo en camelCase mezclados con PascalCase.
- Typos heredados de dominio (`discountPersent`, `discounte`) que afectan legibilidad.
- `console.error` de bajo nivel en el dashboard admin.
- `.stylelintrc.json` huérfano.
- SVG de scaffold y `Contexto_proyecto_final.md` vacío.
- Métodos de servicio y tipos sin consumidores.
- Falta de metadata específica para la mayoría de rutas y ausencia visible de sitemap/robots/Open Graph.

## Código muerto, imports y señales de mantenimiento

- No hay marcadores `TODO`/`FIXME` relevantes en `src`.
- Sí hay `console.error` en `src/app/admin/page.tsx`.
- Hay catches deliberadamente silenciosos en facets, perfil de checkout, refresh silencioso del carrito y storage.
- `ProductReviews`, `getByCategory`, `createMultiple`, `FormState` y `validation.util` no tienen uso detectado.
- No se observan imports no usados que bloqueen el build; el lint no reporta errores.

# Build/Lint/Test Status

## Verificaciones ejecutadas

| Comando/verificación | Resultado | Observaciones |
|---|---|---|
| `npm run lint` | **PASS**, exit code 0 | 0 errores, 6 warnings por `<img>` sin `next/image` |
| `npm run build` | **PASS**, exit code 0 | Next 16.2.6/Turbopack compiló; TypeScript finalizó sin errores; se generaron 16 rutas app |
| `npm run start -- -p 3100` | **PASS** | Servidor local listo |
| HTTP smoke de rutas | **PASS** | Las 16 rutas respondieron 200 en local |
| `GET <API_URL>/products` | **NO VERIFICADO** | No hubo respuesta dentro del timeout; no se imprimió la URL ni ningún secreto |
| `npm test` | No ejecutado | No existe el script |
| Tests automatizados | No disponibles | No hay framework, archivos ni coverage |
| Inspección visual manual | **NO VERIFICADO** | Se verificó routing HTTP, no una matriz visual de navegador |

## Warnings de lint

1. `src/app/admin/products/page.tsx:161`.
2. `src/components/cart/cartItemRow.tsx:62`.
3. `src/components/forms/ProductForm.tsx:382`.
4. `src/components/orders/OrderDetailView.tsx:68`.
5. `src/components/products/ProductCard.tsx:17`.
6. `src/components/products/ProductDetail.tsx:102`.

El estado de Git no mostró modificaciones de archivos tracked después de las verificaciones. El directorio no trackeado `docs/` ya estaba presente y no fue alterado.

# Portfolio Assessment

| Área | Nivel | Justificación |
|---|---|---|
| A) Front-End Junior React | **ACEPTABLE** | Hay múltiples páginas, hooks, Context, formularios, estados y un flujo de compra completo. Lo rebajan bugs de flujo, falta de tests, accesibilidad y seguridad. |
| B) Full Stack Developer | **DÉBIL** | El repo sólo contiene frontend; el backend es externo. Hay integración REST, pero no se pudo ejecutar ni demostrar contra la API actual. |
| C) React/Next/TypeScript | **ACEPTABLE** | React 19, Next 16 App Router, TypeScript strict, alias y modelos reales. Next se usa principalmente como shell client-side; no demuestra Server Components, data fetching server, route handlers o middleware. |
| D) UI/UX | **DÉBIL** | Hay intención visual y tema oscuro, pero el hero remoto, footer simulado, componentes inconsistentes, falta de reviews visibles, a11y incompleta y apariencia de plantilla limitan mucho la señal profesional. |
| E) Integración REST | **ACEPTABLE** | Hay cliente central y servicios por dominio con muchos endpoints. El contrato es inconsistente entre archivos/documentos, no hay schemas/tests y el backend no respondió. |
| F) Ingeniería de software | **DÉBIL** | No hay tests, CI, observabilidad, validación runtime ni manejo robusto de concurrencia/errores; la organización inicial sí es aprovechable. |

## Valor para la oportunidad Front-End Junior React

Puede servir como repositorio de conversación si se presenta honestamente como una aplicación académica amplia y se explican decisiones y límites. No conviene presentarlo hoy como una aplicación de producción ni como prueba fuerte de seguridad, testing o diseño de sistemas. Para competir profesionalmente, la amplitud actual necesita ser acompañada por una reducción visible de deuda, pero ese rework todavía no forma parte de esta auditoría.

# Qué vale la pena conservar

## Funcionalidad

- El dominio completo de e-commerce: catálogo → detalle → carrito → checkout → órdenes.
- La gestión admin de productos y estados de orden.
- El límite de stock por talla, que es más específico que un carrito trivial.
- Persistencia de filtros en URL/sessionStorage.
- Polling de órdenes con pausa al ocultar la pestaña y estados terminales.
- Libreta de direcciones y tarjetas como concepto de UX, sujeto a revisar totalmente el tratamiento de datos sensibles.
- Localización de moneda, idioma y departamentos de Bolivia.

## Código y arquitectura

- La estructura App Router y las rutas dinámicas.
- Los modelos de dominio como referencia inicial del contrato.
- La separación de servicios por dominio.
- `AuthContext`, `CartContext`, `ThemeContext` como límites conceptuales, aunque su implementación necesita auditoría/replanteamiento.
- `useProducts` como encapsulación de filtros/URL/persistencia, especialmente la intención de resetear página al cambiar filtros.
- Componentes pequeños: `Button`, `Input`, `Select`, `Badge`, `Spinner`, `ProductCard`, `OrderStatusBadge`.
- `ProductForm` compartido entre creación y edición como idea de reutilización.
- Variables de tema de `globals.css` y la base Tailwind v4.
- Formatters de moneda y fecha de Bolivia.
- La colección Postman como inventario inicial de endpoints, no como contrato definitivo.

## Partes que probablemente no conviene reutilizar sin reemplazo

- Tratamiento de auth/token y guards como mecanismo de seguridad.
- Modelo y flujo actual de pago con tarjeta completa.
- Cliente API y parseo de respuestas sin contrato runtime.
- Lógica de filtrado client-side para un catálogo que pueda crecer.
- Páginas monolíticas de checkout, admin y catálogo.
- Modal/drawer si se requiere accesibilidad profesional.
- Footer con interacciones simuladas y assets externos sin control.
- Módulo de reviews tal como está: existe, pero está desconectado y su contrato de auth de lectura contradice Postman.

# Principales problemas

1. **Datos completos de tarjeta en frontend, payload y modelo de usuario**: riesgo de seguridad/compliance y el problema más grave del producto.
2. **Auth y autorización de frontend**: JWT en `localStorage`, guards falsificables y ausencia de evidencia de protección server-side; la seguridad real depende de un backend no disponible.
3. **Cero tests automatizados**: no hay red de seguridad para auth, carrito, checkout, admin ni responsive.
4. **Contrato REST inconsistente/no verificable**: Postman, README y código no coinciden en endpoints y paginación; la API configurada no respondió.
5. **Estado asíncrono frágil**: race conditions en catálogo, requests sin abort, timeout que no cancela, polling duplicable y errores de carrito sin feedback.
6. **Flujos con bugs observables en código**: retry de órdenes no reintenta, selección de tarjeta guardada no se marca, IDs inválidos quedan en loading y registro no auto-loguea.
7. **Producto visual incompleto**: newsletter, redes, legal y soporte son elementos falsos; reviews están implementadas pero no aparecen.
8. **Calidad Next/performance limitada**: casi todo es client-side, no se aprovechan Server Components ni boundaries, se descargan listas completas y todas las imágenes son `<img>`.
9. **Accesibilidad insuficiente**: modales/drawers sin foco/semántica completa, labels sin asociación en login, icon buttons sin nombres claros y mensajes no anunciados.
10. **Deuda de arquitectura/mantenimiento**: páginas y componentes grandes, duplicación de formatters/mappings, tipos/casts optimistas, dead code y configuración huérfana.

# Mapa de archivos relevantes

| Archivo/ruta | Responsabilidad | Estado actual | Problemas observados | Importancia para futuro rework |
|---|---|---|---|---|
| `package.json` | Scripts y dependencias | Funcional | Sólo lint/build; no test; `npm install` en Vercel | Muy alta |
| `package-lock.json` | Resolución de dependencias | Presente | El árbol instalado tiene 3 extraneous | Alta |
| `tsconfig.json` | TypeScript | Funcional | `skipLibCheck`, `allowJs`, sin reglas de unused/unchecked | Alta |
| `next.config.ts` | Config Next | Mínima | Sólo trailing slash; sin headers, imágenes ni políticas | Alta |
| `eslint.config.mjs` | Lint | Funcional | Reglas base; 6 warnings de imágenes | Media |
| `postcss.config.mjs` | Tailwind/PostCSS | Funcional | Correcto para Tailwind 4 | Media |
| `.stylelintrc.json` | Stylelint | Huérfano | No hay stylelint instalado/script | Baja |
| `vercel.json` | Deploy Vercel | Presente | Install no determinista; backend/env no se comprueban | Alta |
| `.env.local` | URL API local | Ignorado y configurado | Valor no revisado/imprimido; backend sin respuesta | Crítica |
| `src/app/layout.tsx` | Root layout/providers/sidebar/metadata | Aprovechable | Provider global, script inline, metadata mínima | Crítica |
| `src/app/globals.css` | Tokens, dark mode, animations, marquee | Aprovechable | Transiciones globales, reduced motion parcial, tokens mezclados | Alta |
| `src/app/page.tsx` | Home/hero/footer/featured | Funcional visualmente | Imagen externa, footer fake, client fetch, 204 líneas | Alta |
| `src/app/products/page.tsx` | Catálogo | Funcional | Facets silenciosos, depende de fetch client, no metadata | Alta |
| `src/app/products/[id]/page.tsx` | Detalle route | Funcional | Error propio pero no `notFound`, fetch client | Alta |
| `src/app/cart/page.tsx` | Carrito | Funcional en happy path | Refresh duplicado y errores no controlados | Crítica |
| `src/app/checkout/page.tsx` | Checkout completo | Grande/frágil | Tarjeta completa, 410 líneas, auth/profile anticipado | Crítica |
| `src/app/orders/page.tsx` | Lista/polling de órdenes | Bug de retry | `handleRetry` no ejecuta fetch, depende del backend | Alta |
| `src/app/orders/[id]/page.tsx` | Detalle/polling | Frágil | IDs inválidos en loading, effect complejo | Alta |
| `src/app/profile/page.tsx` | Perfil readonly | Funcional | Sin edición; tarjeta sólo enmascarada en vista | Media |
| `src/app/admin/page.tsx` | Dashboard | Funcional parcial | Errores parciales silenciados, clases Tailwind dinámicas | Alta |
| `src/app/admin/products/page.tsx` | Lista/product delete | Funcional parcial | Fetch inicial y focus separados; tabla mobile | Alta |
| `src/app/admin/products/create/page.tsx` | Alta producto | Funcional en código | Redirect con timeout; contrato backend no verificado | Alta |
| `src/app/admin/products/edit/[id]/page.tsx` | Edición producto | Frágil | ID inválido en loading; update type/DTO dudoso | Alta |
| `src/app/admin/orders/page.tsx` | Admin orders/actions | Grande | 277 líneas, mutaciones repetidas, cancelación sin confirmación | Alta |
| `src/app/admin/orders/[id]/page.tsx` | Admin order detail | Frágil | ID inválido en loading; usa endpoint de usuario | Alta |
| `src/components/layout/Sidebar.tsx` | Navegación responsive/auth | Reutilizable | Focus/inert móvil faltante, 206 líneas | Alta |
| `src/components/auth/AuthScreen.tsx` | Login/register/transición | Funcional parcial | No auto-login, open redirect, dos forms en DOM, overflow móvil | Crítica |
| `src/components/products/ProductCard.tsx` | Card de producto | Bueno/reutilizable | `<img>` sin optimizar ni dimensiones | Media |
| `src/components/products/ProductDetail.tsx` | Compra desde detalle | Grande | Error async sin feedback, auth/stock/UI acoplados | Alta |
| `src/components/products/ProductFilter.tsx` | Drawer y filtros | Muy grande | 430 líneas, foco incompleto, sliders y URL indirectos | Alta |
| `src/components/products/ProductReviews.tsx` | Reviews/rating | Huérfano | No usado por ninguna página; a11y y auth contract | Alta |
| `src/components/forms/ProductForm.tsx` | Create/edit product form | Muy grande | Validación manual, DTO dudoso, flex mobile frágil | Alta |
| `src/components/forms/PaymentBook.tsx` | Tarjetas guardadas | Funcional parcial | Key incompatible con `CheckoutPage`; muestra sólo últimos 4 | Crítica |
| `src/components/forms/Modal.tsx` | Confirmaciones | Reutilizable | Sin semántica/focus trap | Alta |
| `src/components/ui/Button.tsx` | Botón base | Bueno | No resuelve icon-only a11y; siempre `<button>` | Media |
| `src/components/ui/Input.tsx` | Input base | Bueno | Label depende de `name/id`; errores sin `aria-describedby` | Alta |
| `src/components/ui/Select.tsx` | Select base | Bueno | Placeholder no necesariamente disabled; error no asociado | Media |
| `src/context/AuthContext.tsx` | Estado auth | Crítico/frágil | localStorage, double cast, guard UX | Crítica |
| `src/context/CartContext.tsx` | Estado carrito | Funcional parcial | Optimismo sin feedback, timeout no aborta, refetch duplicado | Crítica |
| `src/context/ThemeContext.tsx` | Tema | Bueno con deuda | Persistencia y script duplicados; default no respeta sistema | Media |
| `src/guards/AuthGuard.tsx` | UX de usuario protegido | Sólo UX | No server authorization | Crítica |
| `src/guards/AdminGuard.tsx` | UX de admin protegido | Sólo UX | No server authorization | Crítica |
| `src/hooks/useProducts.ts` | Estado catálogo | Valioso pero frágil | Race conditions, fetch client completo | Alta |
| `src/services/api.service.ts` | Cliente REST central | Crítico | Casts, parse heurístico, sin timeout/retry/abort | Crítica |
| `src/services/product.service.ts` | Catálogo/filtros/facets | Funcional pequeña escala | Descarga todo, endpoints contractuales ambiguos | Alta |
| `src/services/auth.service.ts` | Registro/login | Simple | Basic GET, no auto-login de registro | Crítica |
| `src/services/cart*.service.ts` | Carrito | Delgados | Dependencia de slash y errores sin capa superior | Crítica |
| `src/services/order.service.ts` | Órdenes | Delgado | Payload sensible y slash contractual | Crítica |
| `src/services/admin-*.service.ts` | Admin REST | Delgados | Endpoints no verificados, `getById` admin usa ruta de usuario | Alta |
| `src/services/rating.service.ts` / `review.service.ts` | Reviews/rating REST | Huérfanos | No consumidores; auth de lectura contradice Postman | Media |
| `src/models/*.model.ts` | Dominio/API | Útiles como referencia | Typos, nullable inconsistente, tarjeta completa | Alta |
| `src/types/*.type.ts` | Tipos genéricos | Parcial | `FormState` sin uso, envelope no integrado | Media |
| `src/utils/token.util.ts` | JWT/localStorage | Crítico | XSS exposure, claims no validadas | Crítica |
| `src/utils/currency.util.ts` / `datetime.util.ts` | Formatters | Buenos | Moneda duplicada fuera de util | Media |
| `src/utils/validation.util.ts` | Validaciones | Huérfano | No se usa | Baja |
| `ShopWave.postman_collection.json` | Referencia API manual | Útil pero desactualizada | Contrato no coincide con frontend | Alta |
| `README.md` / `README_MIGRACION_VERCEL.md` | Documentación | Desalineada | Netlify/Vercel, `BACKEND_URL`, endpoints y claims de flujo | Media |
| `docs/EXPOSICION_5_PARTES.md` | Documento no trackeado | Fuera de HEAD | Contiene credencial de ejemplo no reproducida aquí; claims no todos coinciden con código | Alta |
| `public/*.svg` | Assets scaffold | No usados | Ruido de entrega | Baja |
| `Contexto_proyecto_final.md` | Contexto | Vacío | No aporta información | Baja |

# Riesgos

| Riesgo | Probabilidad | Impacto | Verificación |
|---|---:|---:|---|
| Exposición/retención de tarjeta completa | Alta | Crítico | Verificado en modelos, formulario y payload |
| Robo de JWT por XSS | Media/alta | Alto | Verificado por `localStorage`; XSS explotable no probado |
| Backend/API no reproducible | Alta en el entorno auditado | Alto | API no respondió; causa exacta NO VERIFICADA |
| Contrato de endpoints/paginación roto | Media/alta | Alto | Drift documentado; respuesta backend NO VERIFICADA |
| Respuestas stale y estados inconsistentes | Media | Alto | Verificado estáticamente en effects/fetches |
| Admin UI visible sin autorización real | Media | Crítico si backend falla | Guard client-side verificado; backend NO VERIFICADO |
| Open redirect desde login | Media | Alto | Verificado estáticamente |
| Clipping/overflow en móvil | Media | Medio/alto | Inferido por CSS; prueba manual NO VERIFICADA |
| Contraste y navegación de teclado insuficientes | Media | Medio/alto | Hallazgos estáticos; medición NO VERIFICADA |
| Dependencia de imagen externa | Media | Medio | URL hardcodeada verificada; disponibilidad NO VERIFICADA |
| Docs no trackeados con credencial de ejemplo | Media | Alto | Presencia verificada; valor no reproducido |
| Deploy con configuración/env incorrecta | Media | Alto | No se hizo deploy; NO VERIFICADO |

# Conclusión

ShopWave Frontend tiene suficiente material funcional para justificar un rework importante y puede ser una buena base de aprendizaje. No conviene confundir amplitud con madurez: hoy demuestra que se construyó un prototipo e-commerce completo, pero no demuestra todavía seguridad, testing, accesibilidad, contratos de datos, resiliencia ni pulido de producto al nivel esperado de un portfolio profesional.

El build está sano y el lint no tiene errores, lo cual es un punto de partida real. La principal conclusión negativa no es que falte funcionalidad, sino que demasiada funcionalidad está sostenida por supuestos no comprobados: backend externo, guards client-side, casts TypeScript, efectos sin cancelación y un flujo de pago que maneja datos que no debería manejar de esta forma.

Para una oportunidad de Front-End Junior React, el proyecto actual es defendible como muestra de experiencia práctica, pero su estado actual probablemente genera más preguntas de las que responde. Para Full Stack, la evidencia es insuficiente porque el backend no está dentro del repositorio y la integración no pudo validarse. El rework posterior debería partir de esta auditoría, no de una lectura indulgente del README.

# TOP 10 PROBLEMAS ACTUALES

1. Manejo y envío de números completos de tarjeta en el frontend y en el modelo de órdenes.
2. JWT en `localStorage` y guards que son controles de UX, no autorización real.
3. Ausencia total de tests automatizados, coverage y CI.
4. Contrato de API inconsistente entre código, Postman, README y documentación interna; backend no disponible durante la auditoría.
5. Fetching client-side de listas completas y estado asíncrono sin cancelación, retry robusto ni control de respuestas stale.
6. Bugs concretos en retry de órdenes, selección visual de tarjeta guardada, IDs inválidos y auto-login de registro.
7. Carrito/checkout con errores de mutación sin feedback visible y timeout que no cancela requests.
8. UI/UX con footer, newsletter, enlaces sociales/legal y reviews sin comportamiento o integración real.
9. Accesibilidad incompleta en modales, drawer, labels, icon buttons, headings y anuncios de estado.
10. Componentes monolíticos, lógica duplicada, dead code, assets de scaffold y configuración huérfana.

# TOP 10 ACTIVOS QUE VALE LA PENA CONSERVAR

1. El flujo de negocio completo catálogo → detalle → carrito → checkout → órdenes.
2. La cobertura admin de productos y transiciones de órdenes.
3. La separación conceptual entre `app`, componentes, contextos, hooks, servicios, modelos y utils.
4. Los servicios REST por dominio como inventario inicial de integración.
5. Los modelos TypeScript y las unions de estados como referencia del dominio.
6. `useProducts` y su intención de persistir filtros en URL/sessionStorage.
7. El cálculo de stock por talla y el soporte de variantes del mismo producto.
8. Los componentes UI base y de dominio reutilizables.
9. Los tokens visuales Tailwind/CSS y el tema claro/oscuro.
10. Los formatters de moneda/fecha localizados, la colección Postman y el build reproducible que hoy pasa.
