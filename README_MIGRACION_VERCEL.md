# Migración del Frontend a Vercel

Esta guía explica cómo mover el frontend de ShopWave de Netlify a Vercel
mientras se mantiene el backend en Render.

## Resumen

- **Frontend**: Next.js 16 en Vercel (sustituye Netlify).
- **Backend**: Spring Boot en Render — **no se toca**.
- **Cambios de código**: el frontend llama ahora directo al backend
  (sin proxy), eliminando el riesgo de timeout de serverless functions
  en Vercel durante el cold-start de Render.

## Cambios aplicados en este commit

1. **`src/services/api.service.ts`** — `API_PREFIX` se reemplaza por
   `API_BASE = process.env.NEXT_PUBLIC_API_URL`. La función
   `assertApiBase()` lanza un error claro si la variable no está
   configurada.
2. **`src/app/api/[...path]/route.ts`** — eliminado. El proxy ya no es
   necesario.
3. **`netlify.toml`** — eliminado. Solo aplica a Netlify.
4. **`vercel.json`** — creado. Configuración mínima del framework.

## Configuración en Vercel (paso a paso)

### 1. Crear cuenta / iniciar sesión
- Ir a https://vercel.com e iniciar sesión con GitHub.

### 2. Importar el repositorio
- Click **"Add New…"** → **"Project"**.
- Buscar `sebas123312231/shopwave-frontend`.
- Click **"Import"**.

### 3. Configurar el proyecto

En la pantalla **"Configure Project"**:

- **Project Name**: `shopwave-frontend` (o el nombre que prefieras, define
  la URL final del estilo `shopwave-frontend.vercel.app`).
- **Framework Preset**: Next.js (Vercel lo detecta automáticamente).
- **Root Directory**: `.` (dejar por defecto).
- **Build Command**: `npm run build` (dejar por defecto).
- **Output Directory**: dejar por defecto (lo decide Next.js).

### 4. Variables de entorno

En la sección **"Environment Variables"**, agregar:

| Nombre | Valor | Aplica a |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://shopwave-backend-ky66.onrender.com` | Production, Preview, Development |

Click **"Add"** para cada una. Marcar las tres casillas (Production,
Preview, Development) para que aplique en todos los entornos.

### 5. Deploy
- Click **"Deploy"**.
- Vercel instalará dependencias, correrá `npm run build`, y generará la
  primera URL de preview (algo como
  `https://shopwave-frontend-git-master-sebas123312231.vercel.app`).
- Una vez listo (~2-3 min), Vercel promueve a producción (URL final tipo
  `https://shopwave-frontend.vercel.app` o el subdominio que hayas elegido).

### 6. Configurar dominio personalizado (opcional)
- En el dashboard del proyecto → **Settings** → **Domains**.
- Agregar tu dominio y seguir las instrucciones de DNS.

## Verificación funcional (checklist)

Una vez deployado, probar lo siguiente en orden:

1. **Carga inicial** — abrir `https://<tu-app>.vercel.app`. La home debe
   renderizar con productos. Si ves "NEXT_PUBLIC_API_URL no está
   configurada", falta la variable de entorno.
2. **Catálogo** — ir a `/products`. Deben listarse 30 productos.
3. **Filtros** — aplicar un filtro de color azul y verificar que la lista
   cambia. Si no carga, abrir DevTools → Network y revisar si las
   requests a `https://shopwave-backend-ky66.onrender.com/...` están
   pasando.
4. **Detalle de producto** — entrar a un producto. Tallas y stock deben
   mostrarse correctamente.
5. **Registro / login** — crear una cuenta nueva. El JWT debe llegar en
   la respuesta y guardarse en localStorage.
6. **Carrito** — agregar un producto al carrito. La cantidad per-talla
   debe estar limitada por el stock de esa talla específica (no del total).
7. **Checkout paso 1 (dirección)** — seleccionar una dirección guardada o
   llenar una nueva. Avanzar al pago.
8. **Checkout paso 2 (pago)** — seleccionar una tarjeta guardada o llenar
   una nueva. Si la validación falla (p.ej. tarjeta con menos de 16
   dígitos), el usuario debe quedarse en el paso 2 con el error visible
   (no debe rebotar al paso 1).
9. **Confirmar orden** — la orden debe crearse y el usuario debe ver
   "Tu orden ha sido registrada".
10. **Mis órdenes** — la nueva orden debe aparecer en `/orders` sin
    recargar (polling silencioso de 3s).
11. **Perfil** — `/profile` debe mostrar la dirección y tarjeta recién
    usadas (gracias al dedup del backend).
12. **Mobile** — abrir DevTools en modo responsive. El sidebar debe tener
    el toggle de tema visible; el header mobile también.
13. **Cambio de tema** — el toggle debe pasar de claro a oscuro sin
    problemas (colores blancos/negros como se diseñó).

## Solución de problemas

### "NEXT_PUBLIC_API_URL no está configurada"
- Volver al dashboard de Vercel → proyecto → **Settings** → **Environment
  Variables**. Agregar `NEXT_PUBLIC_API_URL=https://shopwave-backend-ky66.onrender.com`
  con las tres casillas marcadas. Redesplegar (Deployments → ⋯ → Redeploy).

### CORS errors en consola del navegador
- El backend ya tiene CORS abierto a `*` en `ProjectSecurityConfig.java`.
  Si por alguna razón falla, verificar en el backend que la línea
  `config.setAllowedOriginPatterns(Collections.singletonList("*"));`
  sigue presente y redesplegar Render.

### 401 / "Sesión expirada"
- El JWT se guarda en localStorage con la clave `token` (ver
  `src/utils/token.util.ts`). Si la fecha de expiración pasó, hay que
  volver a iniciar sesión. No es bug, es el comportamiento esperado.

### Cold-start lento de Render en la primera request
- Es esperado. Render free tier duerme la instancia tras 15 min de
  inactividad y tarda 30-50 s en despertar. La primera request será
  lenta; las siguientes serán rápidas. Esto es independiente de Vercel.

## Diferencias con la versión Netlify

| Aspecto | Netlify (antes) | Vercel (ahora) |
|---|---|---|
| URL de la app | `https://shopwavefront.netlify.app` | `https://shopwave-frontend.vercel.app` (o dominio custom) |
| Routing de API | Proxy en `/api/*` (serverless function) | Llamadas directas al backend |
| Timeout de API | 10 s (límite serverless) | Sin límite (llamada directa del navegador) |
| Cold-start de backend | Pasaba por proxy → 504 si >10 s | Tolerante: la llamada del navegador espera lo necesario |
| Variables de entorno | `BACKEND_URL` (server-side) + `NEXT_PUBLIC_API_URL` | Solo `NEXT_PUBLIC_API_URL` (client-side) |
| `netlify.toml` | Requerido | Eliminado |
| `vercel.json` | N/A | Creado |

## Rollback (si algo sale mal)

Si la migración a Vercel falla por algún motivo:

1. **Rollback del código**: `git revert <commit-hash>` y push a master.
   Vercel redesplegará automáticamente.
2. **Volver a Netlify**: el código viejo (con proxy) ya no está en el
   branch. Para volver, restaurar el commit previo al de la migración.

## Próximos pasos opcionales

- Configurar un dominio personalizado (ej. `shopwave.com.bo`).
- Activar Analytics en Vercel para ver tráfico y Web Vitals.
- Configurar auto-deploys desde GitHub para que cada push redespliegue.
