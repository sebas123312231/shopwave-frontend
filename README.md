# ShopWave Fusion - Frontend

> E-commerce universitario construido con Next.js 16, React 19, TypeScript y Tailwind CSS v4.

---

## Contexto del Proyecto

**ShopWave Fusion** es una plataforma de e-commerce diseñada para entornos universitarios. El frontend está construido con **Next.js 16.2.6 (App Router)** usando **React 19.2.4**, **TypeScript** en modo estricto, **Tailwind CSS v4** y **Turbopack** como bundler. El backend es un servicio Spring Boot que corre en Docker.

### Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16.2.6 | Framework React con App Router |
| React | 19.2.4 | Librería UI |
| TypeScript | 5.x | Tipado estático (strict mode) |
| Tailwind CSS | v4 | Estilos con variables CSS custom |
| Turbopack | - | Bundler rápido para desarrollo |
| JWT | - | Autenticación via token |

### Autenticación

El sistema usa **JWT** para autenticación. El flujo es:

1. **Registro** (`POST /auth/signup`): Crea usuario con rol `ROLE_USER`
2. **Login** (`GET /auth/signin` con Basic Auth): Devuelve JWT en header `Authorization` (sin prefijo `Bearer`)
3. **Requests protegidas**: Enviar JWT en header `Authorization` sin prefijo

### Endpoints Principales

- `POST /auth/signup` - Registro de usuarios
- `GET /auth/signin` - Login con Basic Auth
- `GET /products` - Listar productos (público)
- `GET /cart/` - Carrito (requiere JWT)
- `POST /orders/` - Crear orden (requiere JWT)
- `POST /admin/products/` - Crear producto (requiere `ROLE_ADMIN`)

---

## Instalación

### Prerrequisitos

- **Node.js** 18.x o superior
- **npm** 9.x o superior
- **Docker** (para el backend)
- **Docker Compose** (para levantar el backend)

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd shopwave-frontend
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias del proyecto listadas en `package.json`.

### Paso 3: Variables de entorno

El proyecto incluye un archivo `.env.local` con la configuración básica:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

> **Nota:** El token JWT nunca debe ir en variables de entorno. Se maneja directamente en el código via `localStorage`.

### Paso 4: Levantar el backend (Docker)

El backend debe estar corriendo para que el frontend funcione correctamente.

```bash
# Ir al directorio del backend (suponiendo que está en un repo separado)
cd ../shopwave-backend

# Levantar todos los servicios con Docker Compose
docker-compose up -d

# Verificar que el contenedor está corriendo
docker ps
```

El backend estará disponible en `http://localhost:8080`.

### Paso 5: Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con Turbopack |
| `npm run build` | Genera build de producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |

---

## Docker - Backend

### Levantar el backend

```bash
# Desde el directorio del backend
docker-compose up -d
```

### Ver logs del contenedor

```bash
docker-compose logs -f
```

### Detener el contenedor

```bash
docker-compose down
```

### Reconstruir imagen

```bash
docker-compose build --no-cache
```

### Verificar que el backend está respondiendo

```bash
curl http://localhost:8080/products?page=0&size=1
```

---

## Estructura del Proyecto

```
shopwave-frontend/
├── src/
│   ├── app/                    # Rutas (App Router)
│   │   ├── login/              # Página de login
│   │   ├── register/           # Página de registro
│   │   ├── products/          # Catálogo de productos
│   │   ├── cart/              # Carrito de compras
│   │   ├── orders/            # Órdenes del usuario
│   │   ├── profile/           # Perfil del usuario
│   │   └── admin/             # Panel de administración
│   ├── components/            # Componentes reutilizables
│   │   ├── layout/           # Navbar, Footer, etc.
│   │   └── ui/               # Componentes atómicos
│   ├── models/               # Interfaces TypeScript
│   ├── types/                # Tipos genéricos
│   ├── services/             # Llamadas a la API
│   ├── hooks/                # Custom hooks de React
│   ├── context/              # React Context (Auth)
│   ├── guards/               # Guardianes de rutas
│   └── utils/               # Utilidades (token, currency, validation)
├── .env.local                # Variables de entorno locales
├── .vscode/                  # Configuración del IDE
└── package.json
```

---

## Uso de IA en el Proyecto

Si necesitas usar inteligencia artificial (ChatGPT, Copilot, Claude, etc.) para ayudarte con el desarrollo:

1. **Código base**: Comparte el archivo `01_Base_Compartida_y_Estrategia.md` para dar contexto completo del proyecto
2. **Stack**: Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4
3. **Backend**: Spring Boot en Java, corriendo en Docker en `localhost:8080`
4. **Autenticación**: JWT sin prefijo Bearer, guardado en `localStorage` con key `shopwave_token`
5. **Modelos**: Están en `src/models/` - usa estos tipos en lugar de inventar nuevos
6. **API Service**: No modificar `src/services/api.service.ts` sin consenso del equipo - es el archivo sagrado
7. **Estilos**: Usar variables CSS (`var(--color-*)`) definidas en `globals.css`, no colores hardcodeados

---

## Reglas del Equipo

1. **Archivos sagrados** (no modificar sin consenso):
   - `src/services/api.service.ts`
   - `src/context/AuthContext.tsx`
   - `src/app/layout.tsx`
   - `src/utils/token.util.ts`
   - `tsconfig.json`
   - `.env.local`

2. **Convención de commits**:
   ```
   feat: agregar nueva funcionalidad
   fix: corregir bug
   refactor: reestructurar código
   docs: actualizar documentación
   ```

3. **Tipado**: TypeScript en modo estricto - `any` prohibido sin justificación documentada.

---

## Troubleshooting

### Error "Cannot read properties of undefined (reading 'map')"

Asegúrate de que el backend esté corriendo y que los endpoints返回 la estructura esperada.

### Error de CORS

Verificar que el backend tenga configurados los headers CORS correctamente.

### Errores de tipado

Ejecutar `npm run build` para ver errores TypeScript.

---

**Tech Lead:** Mayo 2026