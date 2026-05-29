# Implementacion Dark Mode - ShopWave Fusion

## 1. Estrategia de Estado Global del Tema

### Arquitectura: CSS Custom Properties + React Context

Se utilizo una estrategia de **tokens semanticos con CSS Custom Properties** (`@theme` de Tailwind v4) combinada con un **Context de React** para el estado global.

**Como funciona:**

1. **`ThemeContext`** (`src/context/ThemeContext.tsx`): Un contexto de React que maneja el estado del tema (`'light' | 'dark'`). Al cambiar el tema, agrega o remueve la clase `.dark` en el elemento `<html>`.

2. **Persistencia con `localStorage`**: El tema seleccionado se guarda en `localStorage` bajo la clave `shopwave-theme`. Al recargar la pagina, el tema se restaura automaticamente.

3. **Script anti-FOUT**: Se inyecto un script inline en `<head>` del `layout.tsx` que lee `localStorage` y aplica la clase `.dark` **antes** de que React hidrate, eliminando el flash de tema incorrecto (Flash of Unstyled Theme).

4. **CSS Variables con override**: En `globals.css`, las variables `@theme` de Tailwind v4 definen los colores semanticos. Dentro del selector `.dark { ... }`, esas mismas variables se redefinen con valores oscuros. Esto hace que **todos los componentes que usan clases como `bg-surface`, `text-foreground`, `border-border` se actualicen automaticamente** sin necesidad de agregar `dark:` en cada componente.

```
Light Mode:  --color-surface: #ffffff    →  bg-surface = fondo blanco
Dark Mode:   --color-surface: #1e293b    →  bg-surface = fondo oscuro
```

**Ventaja clave**: Esta estrategia es O(1) en complejidad de mantenimiento. No importa cuantos componentes nuevos se agreguen; si usan los tokens semanticos, el dark mode funciona automaticamente.

---

## 2. Archivos Principales Modificados

### Archivos NUEVOS (creados desde cero):

| Archivo | Proposito |
|---------|-----------|
| `src/context/ThemeContext.tsx` | Context global del tema con persistencia en localStorage |
| `src/components/ui/ThemeToggle.tsx` | Componente visual del switch (sol/luna) con animaciones premium |

### Archivos MODIFICADOS:

| Archivo | Cambio Realizado |
|---------|-----------------|
| `src/app/globals.css` | Tokens semanticos dark mode (`.dark { ... }`), transiciones suaves, tokens amber/purple |
| `src/app/layout.tsx` | Integracion de `ThemeProvider` + script anti-FOUT en `<head>` |
| `src/components/layout/Sidebar.tsx` | Integracion del `ThemeToggle` en header movil y sidebar desktop |
| `src/components/ui/Badge.tsx` | Colores hardcoded → tokens semanticos (`bg-surface-green`, `bg-surface-red`, etc.) |
| `src/components/orders/OrderStatusBadge.tsx` | Todos los estados → tokens semanticos |
| `src/components/products/ProductReviews.tsx` | Alert boxes → tokens semanticos |
| `src/components/products/ProductList.tsx` | Error box → tokens semanticos |
| `src/components/products/ProductFilter.tsx` | Info box → tokens semanticos |
| `src/components/products/ProductCard.tsx` | Hover border → token semantico |
| `src/app/profile/page.tsx` | `bg-white` → `bg-surface`, error box → tokens |
| `src/app/login/page.tsx` | Error box → tokens semanticos |
| `src/app/register/page.tsx` | Error + success boxes → tokens semanticos |
| `src/app/checkout/page.tsx` | Error box + success icon → tokens semanticos |
| `src/app/orders/page.tsx` | Error box → tokens semanticos |
| `src/app/orders/[id]/page.tsx` | Error box → tokens semanticos |
| `src/app/products/[id]/page.tsx` | Error box → tokens semanticos |
| `src/app/admin/page.tsx` | Status colors → tokens semanticos |
| `src/app/admin/orders/page.tsx` | Hover states en botones de accion → tokens semanticos |
| `src/app/admin/products/page.tsx` | Hover state en boton eliminar → token semantico |

---

## 3. Paleta de Colores Oscuros - Explicacion Tecnica

### Filosofia de Diseno

La paleta oscura se construyo sobre una **base slate (pizarra)** que mantiene coherencia con la identidad de ShopWave (azul marino). No es una simple inversion de colores; cada nivel jerarquico fue disenado para mantener contraste legible y confort visual.

### Mapa de Tokens (Light → Dark)

#### Superficies (fondos):

| Token | Light Mode | Dark Mode | Uso |
|-------|-----------|-----------|-----|
| `--color-background` | `#f8fafc` (gris muy claro) | `#0f172a` (slate-900) | Fondo general de la pagina |
| `--color-background-alt` | `#f1f5f9` (slate-100) | `#1e293b` (slate-800) | Fondos secundarios (headers de tabla, inputs) |
| `--color-surface` | `#ffffff` (blanco) | `#1e293b` (slate-800) | Tarjetas, modales, paneles |
| `--color-surface-hover` | `#f8fafc` | `#334155` (slate-700) | Estados hover |

#### Texto:

| Token | Light Mode | Dark Mode | Uso |
|-------|-----------|-----------|-----|
| `--color-foreground` | `#0f172a` (slate-900) | `#f1f5f9` (slate-100) | Texto principal |
| `--color-foreground-muted` | `#64748b` (slate-500) | `#94a3b8` (slate-400) | Texto secundario |

#### Bordes:

| Token | Light Mode | Dark Mode | Uso |
|-------|-----------|-----------|-----|
| `--color-border` | `#e2e8f0` (slate-200) | `#334155` (slate-700) | Bordes generales |

#### Acento:

| Token | Light Mode | Dark Mode | Uso |
|-------|-----------|-----------|-----|
| `--color-accent` | `#3b82f6` (blue-500) | `#60a5fa` (blue-400) | Color de marca, links, botones |
| `--color-accent-light` | `#60a5fa` (blue-400) | `#93c5fd` (blue-300) | Acento claro |

#### Superficies semanticas (alertas/estados):

| Token | Light Mode | Dark Mode | Uso |
|-------|-----------|-----------|-----|
| `--color-surface-red` | `#fef2f2` (red-50) | `#3b1c1c` (rojo oscuro) | Errores, alertas de peligro |
| `--color-surface-green` | `#f0fdf4` (green-50) | `#1a3a2a` (verde oscuro) | Exito, confirmaciones |
| `--color-surface-blue` | `#dbeafe` (blue-100) | `#1e3a5f` (azul oscuro) | Informacion, badges |
| `--color-surface-amber` | `#fffbeb` (amber-50) | `#3b2f10` (ambar oscuro) | Advertencias, estados pendientes |
| `--color-surface-purple` | `#faf5ff` (purple-50) | `#2e1a47` (purpura oscuro) | Estados enviados (shipped) |

#### Texto sobre superficies semanticas:

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--color-text-on-red` | `#b91c1c` (red-700) | `#fca5a5` (red-300) |
| `--color-text-on-green` | `#15803d` (green-700) | `#86efac` (green-300) |
| `--color-text-on-blue` | `#1d4ed8` (blue-700) | `#93c5fd` (blue-300) |
| `--color-text-on-amber` | `#92400e` (amber-800) | `#fcd34d` (amber-300) |
| `--color-text-on-purple` | `#6b21a8` (purple-800) | `#d8b4fe` (purple-300) |

### Principios de contraste aplicados:

1. **Fondos oscuros, no negros puros**: Se uso `slate-900` (#0f172a) y `slate-800` (#1e293b) en lugar de negro puro para reducir la fatiga visual y mantener un tinte calido.

2. **Textos claros, no blancos puros**: El texto principal usa `slate-100` (#f1f5f9) en lugar de blanco puro para evitar el efecto de "vibracion" sobre fondos oscuros.

3. **Acentos mas brillantes en dark mode**: Los colores de acento se aclaran un nivel (blue-500 → blue-400) para mantener la visibilidad sobre fondos oscuros.

4. **Superficies semanticas con tinte**: En lugar de usar grises neutros para las alertas en dark mode, se mantienen los tintes de color (rojo oscuro, verde oscuro, etc.) para preservar la semantica visual.

5. **Transicion suave**: Se agrego `transition: background-color 0.3s ease, color 0.15s ease` a todos los elementos del HTML para que el cambio de tema sea fluido y premium.

---

## Resumen para Defensa

> *"Implementamos un sistema de temas global basado en CSS Custom Properties con Tailwind v4. Los colores se definen como tokens semanticos que se redefinen automaticamente cuando se activa la clase `.dark` en el HTML. Esto significa que el dark mode es transversal a toda la aplicacion sin necesidad de modificar cada componente individualmente. El estado se persiste en localStorage y se aplica antes de la hidratacion de React para evitar flashes visuales. La paleta oscura usa una base slate que mantiene la identidad de marca y cumple con los ratios de contraste WCAG."*
