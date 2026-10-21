# DA-001 — Stack y arquitectura base del frontend

- **Identificador:** DA-001
- **Fecha:** 2026-10-20
- **Estado:** `PROPUESTA`
- **Relacionado:** `docs_ia/contexto/diseno.md`, `docs_ia/contexto/contrato_api.md`,
  `docs_ia/contexto/pruebas/estrategia_pruebas.md`, `P-003`.

## 1. Contexto

El repo `ticketflow-frontend` no tiene código ni stack definido. Se necesita una base para
implementar la interfaz descrita en `funcionalidades.md` y `diseno.md`, consumiendo el API Gateway
(`http://localhost:8080`) descrito en `contrato_api.md`.

El backend aún no expone catálogo, historial, detalle ni cancelación de reservas. Por eso se
requiere una estrategia que permita avanzar la UI sin bloquearse.

## 2. Problema

Elegir un stack que:

- Permita construir rápido el flujo crítico (autenticación, catálogo, disponibilidad, reserva).
- Soporte formularios, estados de carga/error y accesibilidad.
- Permita trabajar con mocks mientras el backend completa endpoints.
- Sea mantenible por un equipo de tres personas en un prototipo de ~6 semanas.
- No introduzca complejidad innecesaria.

## 3. Alternativas consideradas

### Build / framework

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| **Next.js (App Router)** | SSR/SEO, routing integrado, convenciones, ecosistema amplio, buen soporte de TypeScript | Más peso conceptual (server/client components), configuración de entorno y despliegue; SSR no es imprescindible para el prototipo |
| Vite + React Router | SPA simple y rápida; menos conceptos | Sin SSR/SEO integrado; hay que elegir y cablear routing y estructura |
| React Router framework mode | Data loaders modernos | Menor adopción y documentación que Next.js |

### Lenguaje

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| **TypeScript** | Tipado de DTOs, estados y props; refactors seguros | Configuración inicial y disciplina de tipos |
| JavaScript | Menos configuración | Errores en contratos de API y estados; refactors frágiles |

### Estilos / componentes

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| **Tailwind CSS + shadcn/ui** | Componentes accesibles y personalizables; no impone identidad visual; copiar/pegar código | Requiere definir tokens de diseño; dependencia de Tailwind |
| MUI | Completo y rápido de arrancar | Look Material difícil de personalizar; peso |
| CSS Modules / CSS propio | Mínimas dependencias; control total | Más trabajo manual de componentes y accesibilidad |

### Estado y datos

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| **TanStack Query + Zustand** | Caché, reintentos, invalidación y estados de servidor; Zustand mínimo para sesión/UI | Dos dependencias; curva de aprendizaje |
| Redux Toolkit + RTK Query | Ecosistema maduro y devtools | Boilerplate alto para el tamaño del prototipo |
| Context + fetch | Cero dependencias | Caché, reintentos y estados a mano |

### Pruebas

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| **Vitest + React Testing Library + Playwright** | Rápido, integrado con Vite/Next, E2E real | Playwright añade configuración de navegadores |
| Jest + RTL + Cypress | Muy documentado | Configuración más pesada; Cypress más lento |
| Solo Vitest + RTL | Rápido de montar | Sin cobertura E2E del flujo completo |

### Estrategia inicial

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| **Mock-first con MSW** | Avance sin backend; contrato explícito; fácil de sustituir | Hay que mantener mocks sincronizados |
| Solo endpoints existentes | Sin mocks | Bloquea catálogo/historial |
| Esperar al backend | Sin retrabajo | Paraliza el avance |

## 4. Recomendación

Adoptar:

- **Lenguaje:** TypeScript.
- **Framework:** Next.js (App Router).
- **Estilos:** Tailwind CSS + shadcn/ui.
- **Datos/estado:** TanStack Query + Zustand.
- **Pruebas:** Vitest + React Testing Library + Playwright.
- **Paquetes:** npm.
- **Estrategia inicial:** mock-first con MSW (Mock Service Worker), alineado al contrato de
  `contrato_api.md`.

### Estructura propuesta

```
src/
├── app/                      # rutas Next.js (App Router)
│   ├── (public)/
│   │   ├── page.tsx          # catálogo
│   │   └── events/[eventId]/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (private)/
│   │   ├── profile/page.tsx
│   │   ├── reservations/
│   │   └── organizer/
│   └── (admin)/admin/users/
├── components/               # UI y componentes de dominio
├── features/                 # lógica por funcionalidad (events, reservations, auth)
├── lib/                      # api client, query client, utils, validaciones
├── mocks/                    # MSW handlers y datos
├── stores/                   # Zustand (sesión, UI)
└── types/                    # DTOs y tipos del contrato
```

### Decisiones derivadas de Next.js

1. **Rendering:** el catálogo y el detalle pueden usar Server Components para SEO; las acciones
   autenticadas (reserva, mis reservas, organización) usan Client Components.
2. **Sesión:** el token no se expone en el bundle. Opciones a definir en una DA posterior:
   cookie `httpOnly` gestionada por el servidor de Next.js (BFF) o almacenamiento en cliente.
   **No se decide aquí.**
3. **API:** si se usa un BFF/proxy de Next.js, el navegador llama a `/api/*` y Next.js reenvía al
   gateway; esto evita CORS en desarrollo y permite ocultar el token.
4. **Variables de entorno:** `API_GATEWAY_URL` (servidor) y, si aplica, `NEXT_PUBLIC_*` solo para
   valores no sensibles.
5. **CORS:** con proxy/BFF no se depende del CORS del gateway; si se llama directo desde el
   navegador, hay que ajustar el gateway (repo distinto, requiere autorización).

## 5. Ventajas

- TypeScript reduce errores en DTOs y estados.
- Next.js da routing, estructura y SSR cuando haga falta.
- Tailwind + shadcn/ui acelera la UI sin cerrar la identidad visual.
- TanStack Query resuelve caché, reintentos y refresco de disponibilidad.
- MSW permite avanzar sin bloquearse por endpoints faltantes.
- Playwright cubre el flujo crítico de compra.

## 6. Desventajas y riesgos

- Next.js añade conceptos (server/client, caché) y configuración de despliegue.
- SSR con datos autenticados requiere cuidado con cookies y tokens.
- MSW debe mantenerse sincronizado con el contrato; puede dar falsos verdes si se desvía.
- Tailwind + shadcn/ui requiere definir tokens y criterios visuales (pendiente).
- Playwright añade peso y tiempo de ejecución en CI.

## 7. Impacto

- **Dependencias:** se agregarán las del stack (Next.js, React, TypeScript, Tailwind, shadcn/ui,
  TanStack Query, Zustand, MSW, Vitest, RTL, Playwright). **Requiere autorización humana
  explícita** antes de modificar `package.json`.
- **Documentación:** actualizar `AGENTS.md` (comandos), `README.md` del repo y
  `docs_ia/contexto/pruebas/estrategia_pruebas.md` con las herramientas elegidas.
- **Código:** crear la estructura base y la configuración de MSW.
- **Backend:** el contrato vigente es `main`; se requieren cambios acordados (ver §8).

## 8. Respuestas del usuario y cambios de backend acordados (2026-10-20)

| Tema | Decisión |
|---|---|
| Lenguaje | TypeScript |
| Framework | Next.js (App Router) |
| Estilos | Tailwind CSS + shadcn/ui |
| Datos/estado | TanStack Query + Zustand |
| Pruebas | Vitest + React Testing Library + Playwright |
| Paquetes | npm |
| Estrategia inicial | Mock-first con MSW |
| Expiración de sesión | Re-login al recibir `401` (sin refresh) |
| Accesibilidad | WCAG 2.1 AA |
| Rama de inventario | `main` (contrato vigente) |
| Catálogo | Solo mocks por ahora (MSW) |
| Disponibilidad pública | Sí, hacer pública la ruta en el gateway |
| `status` e idempotencia | Corregir en backend |
| Identidad visual | Base neutral shadcn/ui |
| Despliegue | Local + Docker Compose |
| Idioma de UI | Español |
| Almacenamiento del token | Cookie `httpOnly` gestionada por el BFF de Next.js |
| Aprobación | **APROBADA** por el usuario el 2026-10-20 |

### Cambios requeridos en backend

1. Hacer pública `GET /events/{id}/availability` en el gateway.
2. Asignar `status` en el servidor y dejar de exigirlo en el request.
3. Implementar idempotencia (`Idempotency-Key`) en `POST /reservations`.
4. Mergear `feature/Cambios-flyway-Diego` a `main` (409/503, capacidad, incidencias).
5. Exponer endpoints de catálogo (listado, búsqueda, filtros, detalle).
6. Exponer historial, detalle y cancelación de reservas.
7. Enrutar la capacidad en el gateway (cuando exista en `main`).

Mientras 1–3 no estén resueltos, el frontend debe tratar `401`, `409`, `500` y `503` de forma
defensiva y no asumir un contrato estable.

## 9. Estado

`APROBADA` e **IMPLEMENTADA** (2026-10-20): se creó el proyecto con el stack acordado, la
estructura base, el BFF con cookie `httpOnly`, MSW para los endpoints faltantes y las pruebas
unitarias. Ver `P-004` para el detalle.

## 10. Decisiones pendientes (posteriores)

1. Tokens de diseño e identidad visual.
2. Pipeline CI (la opción elegida es local + Docker Compose, sin CI).
3. Merge de `feature/Cambios-flyway-Diego` a `main`.
4. Endpoints faltantes de catálogo, historial, detalle y cancelación.
5. Formularios avanzados (react-hook-form + zod) si la validación actual no basta.

