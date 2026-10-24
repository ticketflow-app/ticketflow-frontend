# Contrato de API para el Frontend

## 1. Propósito y estado

Este documento describe **qué endpoints consume el frontend**, con qué método, autenticación,
cuerpo y respuesta. Es la referencia para implementar la capa de acceso a datos de la UI.

> **Estado:** instantánea verificada el 2026-10-20 contra el código de los repositorios de backend.
> El backend es la fuente de verdad: si cambia, este documento debe actualizarse.
>
> **No existe** un archivo OpenAPI versionado en el workspace. `inventory-service` y
> `user-service` tienen anotaciones springdoc, pero no hay especificación generada y commiteada.
  >
> **Especificación de plataforma:** `docs/Microservicios.docx` y `docs/Arquitectura.docx` (raíz del
> workspace) describen el contrato *objetivo* de 9 microservicios. Este documento describe el
> contrato *real*. Las diferencias están resumidas en la sección 11.
> Cada backend publica además su propio contrato en
> `ticketflow-<servicio>/docs_ia/contexto/contrato_api.md`.

### Rama vigente del contrato

**Decisión del usuario (2026-10-20): `main`.**

| Rama | Qué incluye |
|---|---|
| **`main` (contrato vigente)** | `POST /reservations`, `GET /events/{id}/availability`, `GET /health`. Compensación Redis, **sin** manejo HTTP de rechazos. |
| `feature/Cambios-flyway-Diego` | Lo anterior + `PUT .../capacity`, `GlobalExceptionHandler` (409/503/400), incidencias y reconciliación (DA-001). **No forma parte del contrato hasta mergear a `main`.** |

Consecuencia: contra `main`, un rechazo por falta de disponibilidad termina en **`500`**, no en
`409`; y el endpoint de capacidad **no** está disponible. La corrección está acordada como trabajo
de backend (ver §9).

---

## 2. Base URL y autenticación

- **Base URL:** `http://localhost:8080` (API Gateway). El frontend **no** debe llamar directo a
  los puertos 8081/8082.
- **Autenticación:** `Authorization: Bearer <token>` en todas las rutas protegidas.
- **Rutas públicas en el gateway:** `/api/auth/register`, `/api/auth/login` (y también compatibilidad con `/register`, `/login`), `/actuator*` y `OPTIONS`.
- **Todo lo demás exige token**, incluido `GET /api/inventario/eventos/{eventId}/disponibilidad`.

### 2.1 Prefijo `/api/` — regla del proyecto y BFF

> **Norma del proyecto:** todo endpoint de negocio de la plataforma debe vivir bajo el prefijo
> **`/api/`** (ver `ticketflow-api-gateway/docs_ia/contexto/contrato_api.md` §5,
> `ticketflow-user-service/docs_ia/contexto/contrato_api.md` §5 y
> `ticketflow-inventory-service/docs_ia/contexto/contrato_api.md` §5).

El frontend tiene **dos capas de prefijos**, y no deben confundirse:

| Capa | Prefijo | Quién lo define | Estado |
|---|---|---|---|
| Rutas del BFF (Route Handlers de Next.js) | `/api/**` | Este repo | ✔ Cumple: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`, `/api/gateway/**` |
| Rutas del gateway que el BFF reenvía | `/api/**` | `ticketflow-api-gateway` | ✔ Actualizado: `/api/auth/**`, `/api/usuarios/**`, `/api/inventario/**`, `/api/reservas/**`, `/api/boletos/**` (también mantiene rutas raíz por compatibilidad). |

El proxy `src/app/api/gateway/[...path]/route.ts` concatena `/api/gateway` + la ruta del gateway. La variable de entorno `API_GATEWAY_URL` y `BFF_PREFIX` (`src/lib/api/client.ts`) no cambian; el token viaja en la cookie `httpOnly`, no en la URL.

> ⚠️ **Hueco:** la disponibilidad no es pública. Un visitante sin sesión recibe `401`.
> Si el catálogo debe ser público (HU-05/CU-04), hay que ajustar el gateway o autenticar siempre.

- **`401` del gateway:** cuerpo vacío (el filtro solo fija el status).
- **Rate limit:** 10 req/s por IP con ráfaga de 20 (Redis). Al excederse, el gateway responde
  `429`.
- **Circuit breaker:** si un servicio falla o tarda más de 3 s, el gateway responde `503` con:
  ```json
  { "timestamp": "...", "status": 503, "service": "inventory-service", "message": "El servicio no está disponible en este momento. Intente más tarde." }
  ```

---

## 3. Convenciones de datos

- JSON UTF-8.
- **user-service** envuelve las respuestas en `ApiResponse<T>`:
  ```json
  { "success": true, "message": "...", "data": { }, "errors": null, "timestamp": "..." }
  ```
- **inventory-service** devuelve objetos JSON planos (sin envelope).
- **Roles** (`UserRole`): `"comprador"`, `"organizador"`, `"staff_checkin"`, `"admin"`.
- **Estados de reserva:** `PENDING`, `CONFIRMED`, `CANCELLED`.

---

## 4. Endpoints disponibles

### 4.1 `POST /api/auth/register`

- **Auth:** pública.
- **Request:**
  ```json
  { "name": "Diego", "email": "diego@test.com", "password": "secret123", "role": "comprador" }
  ```
  `role` es opcional; si se envía, solo se permiten los roles habilitados para registro.
- **Response `201`:**
  ```json
  { "success": true, "message": "User registered successfully", "data": { "id": "...", "name": "...", "email": "...", "role": "comprador", "createdAt": "..." }, "errors": null, "timestamp": "..." }
  ```
- **Errores:** `400` datos inválidos, `409` correo existente.

### 4.2 `POST /api/auth/login`

- **Auth:** pública.
- **Request:** `{ "email": "diego@test.com", "password": "secret123" }`
- **Response `200`:**
  ```json
  { "success": true, "message": "Login successful", "data": { "token": "<jwt>", "id": "...", "name": "...", "email": "...", "role": "comprador" }, "errors": null, "timestamp": "..." }
  ```
- **Errores:** `401` credenciales inválidas.

### 4.3 `GET /api/usuarios/me`

- **Auth:** Bearer.
- **Response `200`:** `ApiResponse<GetUserResponseDTO>` con `id`, `name`, `email`, `role`,
  `createdAt`.
- **Errores:** `401`, `404`.

### 4.4 `PATCH /api/usuarios/{id}/rol`

- **Auth:** Bearer con rol `admin`.
- **Request:** `{ "role": "organizador" }`
- **Response `200`:** `ApiResponse<Void>` (`data: null`).
- **Errores:** `400` rol inválido, `403` sin permisos, `404` usuario inexistente.

### 4.5 `GET /api/inventario/eventos/{eventId}/disponibilidad`

- **Auth:** Bearer (ver hueco en §2).
- **Response `200`:**
  ```json
  { "eventId": 1, "localities": [ { "locality": "VIP", "availableTickets": 94 } ] }
  ```
- **Errores:** `401`, `503`.
- **Nota:** solo devuelve disponibilidad. **No** incluye nombre del evento, fecha, precio ni
  localidades configuradas; eso debería venir del catálogo (que no existe).

### 4.6 `POST /api/reservas`

- **Auth:** Bearer.
- **Request actual:**
  ```json
  { "eventId": 1, "locality": "VIP", "quantity": 2, "status": "CONFIRMED" }
  ```
  > ⚠️ **`status` es obligatorio hoy**: la columna `status` es `NOT NULL` y el backend no lo
  > asigna. El frontend no debería decidir el estado; esto debe corregirse en backend (el servidor
  > debería fijar `PENDING`/`CONFIRMED`).
- **Response `200`:**
  ```json
  { "id": 9, "eventId": 1, "locality": "VIP", "quantity": 2, "status": "CONFIRMED" }
  ```
- **Errores (`main`, contrato vigente):** sin `GlobalExceptionHandler`, un rechazo por falta de
  disponibilidad termina en `500`; `401` sin token.
- **Errores planificados (backend):** `409` disponibilidad insuficiente, `503` error de
  persistencia, `400` petición inválida (ya existen en `feature/Cambios-flyway-Diego`).
- **Idempotencia:** **no implementada**. No existe soporte de `Idempotency-Key`; el frontend debe
  evitar dobles envíos deshabilitando el botón.

### 4.7 `PUT /events/{eventId}/localities/{locality}/capacity` (fuera del contrato)

- **Auth:** Bearer (en el servicio; el gateway **no** enruta esta ruta).
- **Request:** `{ "capacity": 100 }`
- **Response `200`:** vacío.
- **Errores:** `400` capacidad inválida.
- **Estado:** existe solo en `feature/Cambios-flyway-Diego`; no está en `main` ni enrutado por el
  gateway. **No usar desde el frontend** hasta que backend lo integre.

### 4.8 `GET /health`

- **Solo inventory-service directo** (`http://localhost:8082/health`). El gateway no lo enruta.
- Devuelve `UP`. No es parte de la UI.

---

## 5. Endpoints que faltan para las funcionalidades del frontend

| Funcionalidad | Endpoint necesario | Estado |
|---|---|---|
| Listar/buscar/filtrar eventos (F2.1, F2.2) | `GET /events?search=&category=&date=&page=` | **No existe** (servicio de catálogo ausente) |
| Detalle de evento (F2.3) | `GET /events/{id}` | **No existe** |
| Localidades, precios y capacidad (F2.3, F5.3) | Incluido en `GET /events/{id}` o `GET /events/{id}/localities` | **No existe** |
| Mis reservas (F4.2) | `GET /reservations` (del usuario autenticado) | **No existe** |
| Detalle de reserva (F4.3) | `GET /reservations/{id}` | **No existe** |
| Cancelar reserva (F4.4) | `POST /reservations/{id}/cancel` o `PATCH` | **No existe** |
| Listar usuarios (F6.1) | `GET /users` | **No existe** |
| Configurar capacidad desde la UI (F5.4) | `PUT .../capacity` enrutado en el gateway | **Fuera del contrato** (solo rama, sin ruta) |
| Disponibilidad pública (F3.1) | `GET /events/{id}/availability` sin token | Existe, **exige token**; cambio acordado en gateway |

**Consecuencia:** el MVP visual se puede construir para autenticación y reserva, pero **no** para
catálogo, historial, detalle ni cancelación hasta que backend exponga esos endpoints.

---

## 6. CORS y desarrollo local

- El gateway solo permite el origen `http://localhost:8081`.
- El puerto por defecto de Next.js es `3000` → **las peticiones directas serán bloqueadas por
  CORS**.
- Opciones:
  1. **BFF/proxy de Next.js** (`/api/*` → `http://localhost:8080`): el navegador llama al mismo
     origen y el servidor de Next.js reenvía; evita CORS y permite ocultar el token.
     **Recomendada** para el frontend.
  2. Cambiar el CORS del gateway (repo distinto, requiere autorización y cambio de configuración).
  3. Correr el dev server en `8081`: **no** es viable, porque ese puerto lo usa `user-service`.
- En producción, el origen del frontend debe estar permitido explícitamente en el gateway (o
  mantenerse el BFF).

---

## 7. WebFlux, MVC y streaming

- `inventory-service` está implementado con **WebFlux** (reactivo) y `user-service` con MVC.
- Para el frontend **es indiferente**: ambos exponen HTTP/JSON; se consumen igual con `fetch` o un
  cliente HTTP.
- WebFlux solo importaría si el backend expusiera **SSE/streaming** (por ejemplo, disponibilidad en
  vivo). Hoy **no** existe. Si se agrega, sería una decisión nueva y el frontend usaría
  `EventSource` o streaming con `fetch`.
- El frontend debe manejar timeouts propios: el gateway corta a los **3 s** y responde `503`.

---

## 8. Riesgos y huecos (resumen)

1. **Rama `main` sin DA-001 completo:** el manejo `409`/`503` y la capacidad están solo en
   `feature/Cambios-flyway-Diego`; falta mergear.
2. **Catálogo inexistente:** no hay listado, búsqueda, filtros ni detalle de eventos.
3. **Disponibilidad no pública:** requiere token; cambio acordado en el gateway.
4. **`status` enviado por el cliente:** defecto de contrato; debe asignarlo el backend.
5. **Sin idempotencia:** el frontend debe prevenir dobles envíos.
6. **CORS:** el gateway solo permite `http://localhost:8081`; Next.js usa `3000` por defecto.
7. **Sin historial/detalle/cancelación de reservas.**
8. **Sin OpenAPI versionado:** el contrato se mantiene a mano.
9. **Rate limit:** 10 req/s por IP; la UI debe evitar ráfagas (debounce, no polling agresivo).

---

## 9. Cambios de backend acordados (2026-10-20)

1. Hacer pública `GET /api/inventario/eventos/{id}/disponibilidad` en el gateway.
2. Asignar `status` en el servidor y dejar de exigirlo en el request.
3. Implementar idempotencia (`Idempotency-Key`) en `POST /api/reservas`.
4. Mergear `feature/Cambios-flyway-Diego` a `main` (409/503, capacidad, incidencias).
5. Exponer endpoints de catálogo (listado, búsqueda, filtros, detalle).
6. Exponer historial, detalle y cancelación de reservas.
7. Enrutar la capacidad en el gateway (cuando exista en `main`).

Hasta que 1–3 estén resueltos, el frontend debe tratar `401`, `409`, `500` y `503` de forma
defensiva y no asumir un contrato estable.

---

## 10. Cómo mantener este documento

1. Verificar el endpoint contra el backend (curl o Swagger) antes de documentarlo.
2. Actualizar la tabla y las notas de rama.
3. Registrar la interacción en `docs_ia/prompts/P-xxx`.
4. No asumir endpoints “probables”: si no está en el código, se marca como faltante.

---

## 11. Contraste con la especificación de plataforma

La especificación de plataforma (`docs/Microservicios.docx`, `docs/Arquitectura.docx`) describe el
estado **objetivo**: 9 microservicios, rutas bajo `/api/**`, errores RFC 9457, paginación,
`Idempotency-Key`, `X-Request-Id` y servicios que hoy no existen (catálogo, check-in,
notificaciones, reseñas, analítica).

| Tema | Especificación de plataforma | Estado real del frontend |
|---|---|---|
| Prefijo de rutas | `/api/**` | **Cumple**: gateway y backends exponen rutas bajo `/api/` y el BFF las reenvía correctamente. |
| Servicios de backend | 9 | 3 (user, inventory) + eureka + gateway |
| Puertos de backend | 8080 gateway · 8081 usuarios · 8082 catálogo · 8083 inventario · 8084 checkin · 8085 notificaciones · 8086 reseñas · 8087 analítica | 8080 gateway · 8081 user · **8082 inventory** (el 8083 queda libre para cuando exista catálogo) |
| Formato de error | RFC 9457 `problem+json` | `ApiResponse` en user-service; JSON plano en inventory-service |
| Paginación | `?page=&size=&sort=` | No implementada |
| Idempotencia | `Idempotency-Key` en reservas | No implementada (§4.6) |
| Correlación | `X-Request-Id` | No implementada |
| Catálogo | `/api/eventos/**` | No existe: el frontend lo simula con MSW (`src/mocks/handlers.ts`) |
| Java / Spring Boot | 25 LTS / 4.1.1 | 21 / 4.1.1 (no afecta al frontend, que consume HTTP) |
| Redis / Kafka | 8.x / 4.3.0 | 7 / 3.9.1 en el compose local |

**Estándar de versiones del proyecto (el frontend no usa Java, Redis ni Kafka; los aplica al
gateway y al inventory-service):** Java 25 LTS · Spring Boot 4.1.1 · Spring Cloud 2025.1.3 ·
Redis 8.x · Apache Kafka 4.3.0 · jjwt 0.13.0 · PostgreSQL 18.x.
El stack propio del frontend es el de `DA-001-stack-frontend.md` (Next.js 16 + TypeScript +
Tailwind + shadcn/ui) y no se ve afectado por este estándar.

**Regla práctica:** este documento y `ticketflow-<servicio>/docs_ia/contexto/contrato_api.md` mandan
sobre la especificación de plataforma para el trabajo diario; la especificación manda sobre el
*destino*. Cuando se implemente un endpoint del contrato objetivo, actualizar ambos documentos en
el mismo cambio.
