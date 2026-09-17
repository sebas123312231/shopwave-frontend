# ShopWave Frontend — Full-Stack Commerce Experience

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=20232A)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-server%20state-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Playwright](https://img.shields.io/badge/Playwright-browser%20tests-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

ShopWave Frontend is the Next.js application for a full-stack e-commerce system. The current rework combines App Router server rendering, typed REST contracts, a same-origin Backend-for-Frontend (BFF), cookie-backed sessions, TanStack Query state flows, responsive Tailwind UI, and complete storefront-to-admin journeys.

> This repository documents the frontend of a collaborative ShopWave project. It is maintained as a portfolio-oriented implementation of the current rework, including the areas I personally designed, implemented, and validated.

The application is intentionally more than a product grid: it covers discovery, variant-aware inventory presentation, authentication, cart consistency, simulated checkout, order history, profile data, and role-protected administration while keeping the browser boundary separate from the Spring Boot API.

## About the Project

The current frontend is built around a clear split between server work and browser interaction:

- **Server Components** load the home page, catalog, facets, and product details from the backend.
- **Client Components** own filters, cart interactions, forms, theme state, order views, profile updates, and admin operations.
- **Next.js route handlers** provide the same-origin BFF for authentication, session inspection, and allowlisted store operations.
- **Zod contracts** validate user input and the JSON returned by the backend before it reaches application state.
- **TanStack Query** coordinates session, cart, profile, order, and admin request state.

The corresponding backend is [sebas123312231/shopwave-backend](https://github.com/sebas123312231/shopwave-backend), documented as the ShopWave API v1 implementation.

## Core Features

### Storefront and catalog discovery

- Home experience with featured catalog content, product highlights, and commerce-focused messaging.
- Product catalog backed by server-side query parameters and backend pagination.
- Search by product text, category filtering, color and variant filters, stock availability, price ranges, and sort options.
- Facet loading for categories, colors, variant labels, and price boundaries.
- Product cards with discount presentation, responsive grids, optimized next/image rendering, and a fallback asset when a remote image fails.
- Product detail pages with validated UUID routing, metadata generation, category context, variant selection, stock-aware quantity controls, and add-to-cart behavior.

### Authentication and account flows

- Registration and login screens with client-side field validation and server-side contract validation.
- Cookie-backed session lifecycle through /api/auth/login, /api/auth/register, /api/auth/logout, and /api/session.
- Profile update flow for name and mobile data.
- Read-only display of saved addresses returned by the backend.
- Session refresh and cache cleanup after logout or an expired authentication response.

### Cart and checkout

- Variant-aware cart: each selected product variant is tracked independently.
- Quantity controls constrained by both the per-variant stock and the application limit of ten units.
- Serialized cart mutations to prevent overlapping add, update, and remove operations from racing in the UI.
- Explicit loading, empty, unavailable-item, mutation-error, and summary states.
- Checkout address capture with optional address saving.
- MOCK/SIMULATED payment flow with no card fields, PAN, or CVV handling.
- Cart version, quote fingerprint, and Idempotency-Key forwarded to the API so the server can detect stale prices/stock and duplicate submissions.

### Orders and administration

- Authenticated order history and order detail views with item snapshots, shipping information, totals, payment status, and lifecycle progress.
- Admin dashboard summary with product and order metrics returned by the API.
- Admin product creation, editing, activation/archive controls, variant inventory editing, and optimistic-version-aware writes.
- Admin order listing, detail view, status transition controls, and error feedback.
- Server-side admin layout that checks the current session and role before rendering the workspace; the backend remains the authoritative authorization boundary.

### Responsive product experience

- Mobile navigation with an accessible menu state and desktop navigation at responsive breakpoints.
- Responsive product grids, forms, checkout columns, account views, and admin tables.
- Mobile filter dialog built with Radix Dialog, while larger screens expose the filter panel inline.
- Light/dark theme with semantic design tokens and reduced-motion handling.
- Empty, loading, not-found, route-error, and global-error boundaries across the App Router surface.

## Technical Architecture

~~~text
Browser
  Next.js App Router
  Server Components + Client Components
          │
          │ same-origin requests
          ▼
Next.js BFF (/api/auth, /api/session, /api/store)
  HttpOnly session cookie
  allowlisted paths and mutation checks
          │ server-side Bearer forwarding
          ▼
ShopWave Backend (/api/v1)
  Spring Boot REST API
          │
          ▼
MySQL + Flyway schema
~~~

The storefront reads public catalog data through server-side helpers in src/lib/server. Browser mutations use the same-origin client transport in src/lib/client/api.ts. The BFF keeps the backend access token out of browser JavaScript and forwards it only from the server-side route handlers.

The BFF also normalizes the route boundary: only known catalog, account, cart, order, and admin paths are forwarded; mutations require the configured origin and JSON content type; request bodies are size-limited; upstream redirects are rejected; and upstream failures become controlled API responses.

## My Role & Rework Contributions

The current rework was implemented across the application boundary rather than as a visual-only refresh.

### Architecture and data flows

- **Rebuilt the client architecture:** replaced the previous browser-heavy service/model/guard structure with a focused App Router implementation, domain components, server helpers, client transport, contexts, and typed contracts. The removal of the legacy surface is recorded in [7297e3c](https://github.com/sebas123312231/shopwave-frontend/commit/7297e3c).
- **Defined the API contract boundary:** implemented the Zod schemas for users, sessions, products, variants, facets, carts, checkout, orders, admin payloads, and problem details in [4b17ba1](https://github.com/sebas123312231/shopwave-frontend/commit/4b17ba1).
- **Implemented the BFF and session transport:** added server-only backend access, cookie lifecycle, origin checks, route allowlisting, body limits, timeout handling, upstream response handling, and session invalidation in [8aad257](https://github.com/sebas123312231/shopwave-frontend/commit/8aad257), [7381367](https://github.com/sebas123312231/shopwave-frontend/commit/7381367), and [29438f8](https://github.com/sebas123312231/shopwave-frontend/commit/29438f8).
- **Structured server state:** moved authentication and cart state to TanStack Query-backed providers, including session refresh, cache invalidation, and serialized cart mutations in [5f5f103](https://github.com/sebas123312231/shopwave-frontend/commit/5f5f103) and [7ffefbc](https://github.com/sebas123312231/shopwave-frontend/commit/7ffefbc).

### Product and UX implementation

- **Catalog:** implemented server-backed catalog access, facets, URL-driven filtering, pagination controls, responsive product grids, product cards, image fallback behavior, and product detail interaction. See [ef12d17](https://github.com/sebas123312231/shopwave-frontend/commit/ef12d17), [d482d2f](https://github.com/sebas123312231/shopwave-frontend/commit/d482d2f), and [1e43777](https://github.com/sebas123312231/shopwave-frontend/commit/1e43777).
- **Commerce journey:** implemented the current authentication screens, variant-aware cart, checkout flow, order list/detail views, profile update, and saved-address presentation in [e59788c](https://github.com/sebas123312231/shopwave-frontend/commit/e59788c), [be1c607](https://github.com/sebas123312231/shopwave-frontend/commit/be1c607), [4138187](https://github.com/sebas123312231/shopwave-frontend/commit/4138187), [8947528](https://github.com/sebas123312231/shopwave-frontend/commit/8947528), and [cbfd89b](https://github.com/sebas123312231/shopwave-frontend/commit/cbfd89b).
- **Administration:** implemented the protected admin workspace for summary data, product operations, order operations, version-aware mutations, and controlled error states in [4c822db](https://github.com/sebas123312231/shopwave-frontend/commit/4c822db).
- **Design system and responsive shell:** established semantic color tokens, light/dark themes, responsive navigation, Radix-based filter dialog behavior, consistent cards/forms/buttons, visible focus styles, and reduced-motion behavior in [bbc8778](https://github.com/sebas123312231/shopwave-frontend/commit/bbc8778) and [70cb642](https://github.com/sebas123312231/shopwave-frontend/commit/70cb642).

The original product was collaborative and began in an academic Web Technologies 2 context. These contribution notes refer to the current rework commits; they do not claim that I authored every historical version of the product before the rework.

## Engineering Highlights

- **Session security:** the backend JWT is stored in an HttpOnly cookie by the BFF; browser code uses same-origin requests and does not read a token from localStorage.
- **Boundary validation:** request payloads and upstream responses are checked with Zod, while structured ProblemDetails responses are converted into user-facing client errors.
- **Commerce consistency:** checkout carries a cart version, quote fingerprint, and idempotency key to the server; stale prices/stock and replayed submissions remain explicit states instead of hidden assumptions.
- **Backend-aware state:** React Query separates server state from local UI state and clears user-scoped caches on logout.
- **Failure handling:** Next error/loading/not-found boundaries, request timeouts, upstream status mapping, empty states, and mutation feedback are part of the current implementation.
- **UI resilience:** product images have a checked-in fallback, form fields expose labels and validation messages, interactive controls expose focus/ARIA attributes, and reduced-motion preferences are respected.
- **SEO and crawl controls:** route metadata, product metadata, sitemap generation, robots rules, and non-indexed account/commerce surfaces are configured in the App Router.
- **Performance boundary:** server-side catalog access and next/image optimization are implemented, but no Lighthouse score, load benchmark, or production performance result is claimed.

## Verification & Quality

The checked-in [docs/REWORK_EVIDENCE.md](./docs/REWORK_EVIDENCE.md) records the following local verification on 2026-09-16:

~~~text
npm run lint          PASS
npm run typecheck     PASS
npm test              PASS (5 files, 11 tests)
npm run test:coverage PASS (32.40% statements; no artificial threshold)
npm run build         PASS (Next.js 16.2.6)
~~~

The repository also contains Playwright scenarios for commerce, browser security, and responsive behavior, configured for desktop and mobile projects. Their execution was not verified in the audited environment because the browser binaries were unavailable. Full-stack browser execution requires an isolated backend/demo environment and disposable credentials. No automated accessibility audit, Lighthouse result, or MySQL parity result is claimed by this README.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript 5 |
| Styling and UI | Tailwind CSS 4, Radix Dialog, Lucide icons, semantic design tokens |
| State and transport | TanStack Query, React Context, native fetch, same-origin credentials |
| Validation | Zod request/response schemas and typed domain contracts |
| Server boundary | Next.js Node.js route handlers, HttpOnly cookies, REST BFF |
| Integration | Spring Boot ShopWave API v1, JSON/REST, Problem Details responses |
| Quality | ESLint 9, Vitest, Testing Library, MSW support, Playwright |
| Hosting configuration | vercel.json for Next.js; no deployed environment is claimed |

## Local Setup

The frontend requires the reworked ShopWave backend to be reachable. The current code reads the backend URL on the server; it does not use the legacy direct-browser NEXT_PUBLIC_API_URL integration.

### Requirements

- Node.js 20.9 or newer for the current Next.js 16 line.
- npm, using the committed package-lock.json.
- A running ShopWave backend, normally at http://localhost:8080.

### Environment

Create .env.local in the repository root. The file is ignored by Git and there is no committed environment template because values are environment-specific:

~~~env
BACKEND_URL=http://localhost:8080
APP_ORIGIN=http://localhost:3000
~~~

BACKEND_URL is server-only. APP_ORIGIN is used by the BFF to reject mutation requests from unexpected origins. Do not put access tokens or secrets in NEXT_PUBLIC_* variables.

### Install, run, and verify

~~~bash
npm install
npm run dev
~~~

Useful local checks:

~~~bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
~~~

The opt-in browser suite requires an isolated backend/demo setup and disposable credentials. Set SHOPWAVE_E2E=1, SHOPWAVE_E2E_USER_EMAIL, and SHOPWAVE_E2E_USER_PASSWORD in the local environment, then run:

~~~bash
npm run test:e2e
~~~

Install the Playwright browser binaries in the normal way for the local environment before running the E2E suite. The test suite is not a substitute for a production security or accessibility audit.

## Project Structure

~~~text
src/app/                  App Router pages, metadata, loading/error boundaries, BFF routes
src/components/           storefront, commerce, account, and admin UI
src/context/              auth, cart, theme, and provider composition
src/contracts/             Zod schemas and inferred TypeScript types
src/lib/server/            backend transport, server session, catalog access, BFF policy
src/lib/client/            browser API transport and normalized client errors
e2e/                       opt-in Playwright commerce, security, and responsive scenarios
docs/REWORK_EVIDENCE.md    implementation and verification boundary
~~~

## Current Status

The current snapshot is the post-rework frontend for ShopWave: catalog discovery, authentication, cart, simulated checkout, order history, profile, and admin interfaces are implemented against the API v1 contract. It depends on the separate Spring Boot/MySQL backend and an isolated local/demo environment for full-stack execution.

No production deployment, real payment processing, user volume, Lighthouse score, automated accessibility certification, or browser E2E pass is claimed here. The payment path is intentionally MOCK/SIMULATED, and the backend remains the source of truth for authorization, stock, totals, and order consistency.

## Related Repositories & Context

- Backend API: [sebas123312231/shopwave-backend](https://github.com/sebas123312231/shopwave-backend)
- Frontend repository: [sebas123312231/shopwave-frontend](https://github.com/sebas123312231/shopwave-frontend)

ShopWave originated as a university Web Technologies 2 project. The current frontend presents the result of a substantial rework and reimplementation effort: legacy client architecture was removed, the API boundary was formalized, security and state flows were rebuilt, and the storefront was reshaped into a coherent full-stack portfolio surface.
