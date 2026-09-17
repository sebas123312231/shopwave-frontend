# ShopWave frontend

Frontend e-commerce de portfolio construido con Next.js App Router, React, TypeScript y Tailwind CSS. La versión actual es un rework coordinado con el backend Spring Boot de [`shopwave-entorno`](../shopwave-entorno).

## Stack y decisiones

- Next.js 16.2.6, React 19.2.4 y TypeScript estricto.
- Tailwind CSS 4 con tokens de tema claro/oscuro.
- Server Components para home, catálogo y detalle; Client Components para interacción.
- BFF de Next.js bajo `/api`: el navegador mantiene una cookie HttpOnly y nunca recibe el JWT del backend.
- Zod valida requests/responses en el borde; TanStack Query gestiona carrito, perfil, órdenes y admin.
- Checkout `MOCK/SIMULATED`: no se solicitan ni almacenan tarjetas, PAN o CVV.
- URLs del catálogo son la fuente de verdad para búsqueda, filtros, orden y paginación.

## Requisitos

- Node.js compatible con Next.js 16.
- npm.
- Backend ShopWave v1 accesible, normalmente en `http://localhost:8080`.

## Configuración

```powershell
Copy-Item .env.example .env.local
```

Edita `.env.local` sólo localmente:

```env
BACKEND_URL=http://localhost:8080
APP_ORIGIN=http://localhost:3000
```

`BACKEND_URL` es server-only y `APP_ORIGIN` se usa para las comprobaciones de origen del BFF. No añadas tokens ni secretos a variables `NEXT_PUBLIC_*`.

## Desarrollo y verificación

```powershell
npm install
npm run dev

npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

Las pruebas unitarias no requieren backend. Las suites Playwright full-stack se habilitan con un backend y una base demo aislada; si ese entorno no está disponible, el resultado debe documentarse como no verificado.

## Rutas principales

| Ruta | Propósito |
|---|---|
| `/` | Home y productos destacados |
| `/products` | Catálogo paginado con búsqueda, filtros y orden |
| `/products/[id]` | Detalle y selección de variante |
| `/login`, `/register` | Autenticación |
| `/cart`, `/checkout` | Carrito y checkout simulado |
| `/orders`, `/orders/[id]` | Historial y detalle propio |
| `/profile` | Perfil y direcciones guardadas |
| `/admin` | Resumen y operaciones protegidas por rol |

## Estructura relevante

```text
src/app/                  rutas, layouts y boundaries
src/app/api/              BFF de autenticación y store
src/components/           UI pública, compra, cuenta y admin
src/context/              sesión, tema y fachada de carrito
src/contracts/            schemas Zod y tipos inferidos
src/lib/client/           transporte browser y errores
src/lib/server/           backend fetch, sesión y allowlist BFF
```

## Evidencia del rework

Las decisiones, comandos comprobados y limitaciones se registran en [`docs/REWORK_EVIDENCE.md`](docs/REWORK_EVIDENCE.md). No se declara una demo publicada, una puntuación Lighthouse ni una verificación MySQL si no existe evidencia reproducible.
