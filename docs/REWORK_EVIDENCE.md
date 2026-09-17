# ShopWave rework evidence

This file records what is implemented and what was actually verified locally. It must be updated with real screenshots and hosted-demo links only when those artifacts exist.

## Architecture evidence

```text
browser -> Next.js Server/Client Components -> same-origin Next BFF -> Spring Boot /api/v1 -> MySQL
```

The browser does not receive the backend access token. The BFF stores it in an HttpOnly cookie, validates the browser origin on mutations and forwards only allowlisted store paths.

## Implemented flows

- Public home, catalog, server-side filters/pagination and product detail.
- Register/login/logout with cookie-backed session.
- Variant-aware cart with canonical backend responses.
- Checkout using `MOCK/SIMULATED`, server totals, quote fingerprint and idempotency key.
- Own order list/detail and profile update/address read.
- Admin summary, product create/update/archive and order status transitions.
- Light/dark theme, responsive layout, loading/error/empty states and keyboard-visible focus styles.

## Local command evidence

Run from the frontend repository (verified locally on 2026-09-16):

```text
npm run lint       PASS
npm run typecheck  PASS
npm test           PASS (5 files, 11 tests)
npm run build      PASS (Next.js 16.2.6)
npm run test:coverage PASS (32.40% statements; no artificial threshold)
```

Run from the backend `backend/` directory:

```text
./mvnw.cmd test               PASS (10 tests)
./mvnw.cmd verify -Pintegration PASS (10 Surefire + 9 Failsafe tests)
```

The backend verification above uses isolated H2. A local HTTP smoke test through the Next BFF also passed with the backend running on H2: public catalog/product, register/login/session, profile, cart, MOCK checkout, order detail/list, USER 403 and ADMIN 200. Playwright collection contains 6 tests in 3 files, but execution is NOT VERIFIED because the environment has no Chromium/WebKit executables. MySQL/Testcontainers parity, automated accessibility, Lighthouse and a deployed demo are not claimed.

## Security evidence to collect before publishing

- Browser storage, HTML and network review showing no JWT, PAN or CVV.
- 401/403 examples for unauthenticated and USER/admin access.
- 409 example for stale cart/stock and idempotency replay.
- Screenshots at 375, 768 and 1440 pixels in both themes.
- Short video of register/login, variant cart, mock checkout and admin status update.
- Dependency audit output with unresolved advisories called out.
