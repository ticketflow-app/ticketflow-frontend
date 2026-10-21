# P-003 — Contrato de API y análisis del stack del frontend

- **Identificador:** P-003
- **Fecha:** 2026-10-20
- **Objetivo:** responder si existe un contrato de endpoints para el frontend, documentarlo, y
  analizar la elección de stack (React) y el impacto de WebFlux en el backend.
- **Prompt completo utilizado:**

  > el stack y el framework, pienso en react, y no se que otra pregunta tienes? ya hay un archivo
  > que se encargue de especificar que endpoints tiene que llamar al backend? y además no se si sea
  > importante aborar cauels cson mas importantes y cuales son con webflux en el backend, etc

- **Archivos de contexto consultados (frontend):**
  - `docs_ia/contexto/funcionalidades.md`
  - `docs_ia/contexto/diseno.md`
  - `docs_ia/contexto/requisitos/historias_usuarios.md`
  - `docs_ia/contexto/requisitos/casos_uso.md`
  - `docs_ia/contexto/calidad/atributos_calidad.md`
  - `docs_ia/README.md`
  - `AGENTS.md`, `.clinerules`

- **Código de backend analizado:**
  - `ticketflow-user-service`: `AuthController`, `UserController`, DTOs, `ApiResponse`,
    `UserExceptionHandler`, `UserRole`.
  - `ticketflow-inventory-service` (`main`): `ReservationController`, `AvailabilityController`,
    `HealthController`, `CreateReservationService`, `Reservation`, `Availability`,
    `LocalityAvailability`, `ReservationPersistenceAdapter`, `RedisAvailabilityAdapter`.
  - `ticketflow-inventory-service` (`feature/Cambios-flyway-Diego`): `CapacityController`,
    `GlobalExceptionHandler`, `CreateReservationService` (DA-001), migraciones `V1`–`V3`.
  - `ticketflow-api-gateway`: `application.yml` (rutas, CORS, rate limit, timeouts),
    `JwtAuthFilter`, `FallbackController`.
  - Búsqueda de OpenAPI/Swagger versionado: **no existe** en el workspace.

- **Hallazgos:**
  1. **No existía** un archivo de contrato de endpoints para el frontend. Se creó
     `docs_ia/contexto/contrato_api.md`.
  2. Endpoints reales hoy: `POST /register`, `POST /login`, `GET /me`,
     `PATCH /users/{id}/rol`, `GET /events/{id}/availability`, `POST /reservations`
     (`GET /health` solo directo).
  3. El DA-001 completo (capacidad, `409`, `503`, incidencias, reconciliación) está en la rama
     `feature/Cambios-flyway-Diego`; `main` solo tiene la compensación y **no** mapea rechazos a
     `409`.
  4. **No existe** servicio de catálogo: faltan listado, búsqueda, filtros y detalle de eventos.
  5. **No existen** historial, detalle ni cancelación de reservas.
  6. La disponibilidad **exige token** en el gateway; un visitante recibe `401`.
  7. El CORS del gateway solo permite `http://localhost:8081`; el puerto por defecto de Vite
     (`5173`) sería bloqueado.
  8. `POST /reservations` exige `status` en el cuerpo porque el backend no lo asigna y la columna
     es `NOT NULL`; es un defecto de contrato a corregir en backend.
  9. No hay idempotencia (`Idempotency-Key`).
  10. WebFlux es un detalle de implementación del backend: el frontend consume HTTP/JSON igual.
      Solo importaría si se agregara SSE/streaming, que hoy no existe.

- **Decisiones/propuestas:**
  - Se documentó el contrato real, marcando rama, auth, errores y huecos.
  - Se propone React como base, pero la decisión completa (lenguaje, build, estilos, datos,
    pruebas) queda pendiente de las respuestas del usuario y de una `DA-xxx` aprobada.
  - Prioridad propuesta del frontend: autenticación → catálogo/detalle → disponibilidad →
    reserva → historial/cancelación → organización → administración.

- **Respuestas del usuario (2026-10-20):**
  - Lenguaje: **TypeScript**.
  - Framework: **Next.js (App Router)**.
  - Estilos: **Tailwind CSS + shadcn/ui**.
  - Datos/estado: **TanStack Query + Zustand**.
  - Pruebas: **Vitest + React Testing Library + Playwright**.
  - Paquetes: **npm**.
  - Estrategia inicial: **mock-first con MSW**.

  Con estas respuestas se creó `docs_ia/decisiones/DA-001-stack-frontend.md` en estado
  `PROPUESTA`. No se instaló nada ni se creó código.

- **Segunda ronda de respuestas (2026-10-20):**
  - Expiración de sesión: **re-login al recibir `401`** (no hay refresh token).
  - Accesibilidad: **WCAG 2.1 AA**.
  - Rama de `inventory-service`: **`main`** (el DA-001 completo queda fuera del contrato hasta
    mergear).
  - Catálogo: **solo mocks con MSW** por ahora.
  - Disponibilidad: **hacer pública** la ruta en el gateway.
  - `status` e idempotencia: **corregir en backend**.
  - Identidad visual: **base neutral shadcn/ui** (tokens pendientes).
  - Despliegue: **local + Docker Compose**.
  - Idioma de UI: **español**.
  - Almacenamiento del token: **sin responder** (pregunta pendiente).

  Se actualizaron `DA-001`, `contrato_api.md`, `diseno.md` y `README.md`. No se instaló nada ni se
  creó código.

- **Decisiones pendientes:**
  - Aprobar o rechazar `DA-001`.
  - Almacenamiento del token (cookie `httpOnly` + BFF vs cliente).
  - Tokens de diseño e identidad visual.
  - Pipeline CI (la opción elegida es local + Docker Compose, sin CI).
  - Merge de `feature/Cambios-flyway-Diego` a `main`.
  - Endpoints faltantes de catálogo, historial, detalle y cancelación.

- **Estado:** `PROPUESTA` (contrato documentado; stack propuesto en DA-001; token pendiente).

