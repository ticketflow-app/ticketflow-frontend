# P-004 — Scaffolding del frontend (implementación de DA-001)

- **Identificador:** P-004
- **Fecha:** 2026-10-20
- **Objetivo:** Implementar el stack aprobado en `DA-001` y montar la estructura base del
  frontend (BFF con cookie `httpOnly`, MSW, páginas mínimas y pruebas).
- **Prompt:** "¿Cómo guardamos el token?" + "¿Apruebas DA-001 para empezar a crear el
  frontend?" → respuestas: **BFF + cookie httpOnly** y **Sí, aprobar y scaffolding**.

## Contexto consultado

- `docs_ia/decisiones/DA-001-stack-frontend.md`
- `docs_ia/contexto/contrato_api.md`
- `docs_ia/contexto/funcionalidades.md`, `docs_ia/contexto/diseno.md`
- `AGENTS.md` (gobernanza) y `.clinerules`
- `ticketflow-api-gateway/src/main/resources/application.yml`,
  `ticketflow-api-gateway/src/main/java/ticketflow/api_gateway/filter/JwtAuthFilter.java`

## Autorización

- El usuario **aprobó `DA-001`** y autorizó crear el proyecto, instalar dependencias y montar
  la estructura base (autorización explícita exigida por la gobernanza, §6).

## Cambios realizados

### Proyecto

- Scaffold de **Next.js 16.4.2 (App Router) + TypeScript + Tailwind v4** vía `create-next-app`,
  copiado al repo sin pisar `docs_ia/`, `AGENTS.md`, `README.md` ni `.clinerules`.
- Se conservó el `.gitignore` del repo y se añadieron las entradas de Node/Next.

### Dependencias añadidas (aprobadas con DA-001)

| Dependencia | Tipo | Propósito |
|---|---|---|
| `@tanstack/react-query` | runtime | fetching/estado de servidor |
| `zustand` | runtime | estado de sesión en el cliente |
| `@base-ui/react`, `cn`, `class-variance-authority`, `lucide-react`, `tw-animate-css` | runtime | base de shadcn/ui |
| `msw` | dev | mocks de endpoints inexistentes |
| `vitest`, `@vitejs/plugin-react`, `jsdom` | dev | runner de pruebas |
| `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | dev | pruebas de componentes |
| `@playwright/test` | dev | pruebas E2E |
| `@types/node@^22` | dev | alineado con el runtime Node 22 (Vitest 5 lo exige) |

- `shadcn` (CLI) se movió de `dependencies` a `devDependencies` (es una herramienta, no runtime).
- `npm audit --omit=dev` → **0 vulnerabilidades** en producción. Las 5 "high" son de desarrollo y
  **no** se aplicó `audit fix --force`.

### Código y configuración

- **BFF**: `src/app/api/auth/{login,register,logout,me}/route.ts` y
  `src/app/api/gateway/[...path]/route.ts`.
- **Sesión**: `src/lib/auth/session.ts` (cookie `httpOnly`, `sameSite=lax`, `secure` en prod,
  24 h) y `src/lib/auth/current-user.ts`.
- **Cliente/BFF**: `src/lib/api/{client,gateway,types,errors}.ts`.
- **Providers**: `AppProviders` (QueryClient) + `AuthInitializer` (Zustand) + `MswProvider`
  cargado con `next/dynamic` `ssr:false` (MSW v3 no resuelve `msw/browser` en SSR).
- **MSW**: `src/mocks/{handlers,data,browser,server}.ts` para catálogo, detalle, disponibilidad e
  historial; `public/mockServiceWorker.js` generado con `npx msw init public/ --save`.
- **Páginas**: catálogo (`/`), detalle (`/events/[eventId]`), `login`, `register`, `reservations`
  y `profile`.
- **Pruebas**: `vitest.config.mts`, `src/test/setup.ts`, prueba de `EventCatalog` con MSW;
  `playwright.config.ts` + `e2e/catalog.spec.ts`.
- **Config**: `.env.example`, `.env.local`, `next.config.ts` (Cache Components), `instant = false`
  en el layout raíz (la sesión se resuelve leyendo cookies en el servidor).

### Comandos ejecutados

```powershell
npm install
npm install @tanstack/react-query zustand
npm install -D @types/node@^22 msw vitest @vitejs/plugin-react jsdom `
  @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
npx shadcn@latest init -d
npx shadcn@latest add card input label badge alert separator skeleton -y
npx msw init public/ --save
npm run build
npm run lint
npm run typecheck
npm test
```

## Resultado

- `npm run build` → compila y pasa TypeScript (13 rutas generadas).
- `npm run lint` → sin errores ni warnings.
- `npm run typecheck` → sin errores.
- `npm test` → **2/2** pruebas en verde.
- Humo en dev (`next dev`): `GET /` → 200; `POST /api/auth/logout` → 204;
  `GET /api/auth/me` → 401 (sin sesión); `GET /api/gateway/events` → 503 (gateway no disponible).

## Notas y limitaciones

- El backend en `main` **no** expone catálogo, detalle, historial ni cancelación: MSW los simula.
- `GET /events/{id}/availability` existe pero exige token; en dev se sirve por MSW. Falta hacerlo
  público en el gateway (cambio acordado).
- `POST /reservations` en `main` aún espera `status` del cliente y responde `500` al rechazar: el
  frontend envía el cuerpo correcto (`eventId`, `locality`, `quantity`) y el backend debe corregirlo.
- E2E requiere `npx playwright install` (no se instalaron navegadores).
- No se aplicó `npm audit fix --force` (rompería versiones aprobadas).

## Decisiones pendientes

- Tokens de diseño e identidad visual.
- Cambios de backend acordados (disponibilidad pública, `status` en servidor, idempotencia, merge
  de `feature/Cambios-flyway-Diego`, endpoints de catálogo/historial/cancelación).
- Pipeline CI (la opción elegida es local + Docker Compose, sin CI).

- **Estado:** `IMPLEMENTADO`.
