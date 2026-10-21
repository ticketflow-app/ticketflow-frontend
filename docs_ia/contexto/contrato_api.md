# Contrato de API para el Frontend

## 1. Propósito y estado

Este documento describe **qué endpoints consume el frontend**, con qué método, autenticación,
cuerpo y respuesta. Es la referencia para implementar la capa de acceso a datos de la UI.

> **Estado:** instantánea verificada el 2026-10-20 contra el código de los repositorios de backend.
> El backend es la fuente de verdad: si cambia, este documento debe actualizarse.
>
> **No existe** un archivo OpenAPI versionado en el workspace. `inventory-service` y
> `user-service` tienen anotaciones springdoc, pero no hay especificación generada y commiteada.

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
- **Rutas públicas en el gateway:** `/register`, `/login`, `/actuator*` y `OPTIONS`.
- **Todo lo demás exige token**, incluido `GET /events/{eventId}/availability`.

> ⚠️ **Hueco:** la consulta de disponibilidad no es pública. Un visitante sin sesión recibe `401`.
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

### 4.1 `POST /register`

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

### 4.2 `POST /login`

- **Auth:** pública.
- **Request:** `{ "email": "diego@test.com", "password": "secret123" }`
- **Response `200`:**
  ```json
  { "success": true, "message": "Login successful", "data": { "token": "<jwt>", "id": "...", "name": "...", "email": "...", "role": "comprador" }, "errors": null, "timestamp": "..." }
  ```
- **Errores:** `401` credenciales inválidas.

### 4.3 `GET /me`

- **Auth:** Bearer.
- **Response `200`:** `ApiResponse<GetUserResponseDTO>` con `id`, `name`, `email`, `role`,
  `createdAt`.
- **Errores:** `401`, `404`.

### 4.4 `PATCH /users/{id}/rol`

- **Auth:** Bearer con rol `admin`.
- **Request:** `{ "role": "organizador" }`
- **Response `200`:** `ApiResponse<Void>` (`data: null`).
- **Errores:** `400` rol inválido, `403` sin permisos, `404` usuario inexistente.

### 4.5 `GET /events/{eventId}/availability`

- **Auth:** Bearer (ver hueco en §2).
- **Response `200`:**
  ```json
  { "eventId": 1, "localities": [ { "locality": "VIP", "availableTickets": 94 } ] }
  ```
- **Errores:** `401`, `503`.
- **Nota:** solo devuelve disponibilidad. **No** incluye nombre del evento, fecha, precio ni
  localidades configuradas; eso debería venir del catálogo (que no existe).

### 4.6 `POST /reservations`

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

1. Hacer pública `GET /events/{id}/availability` en el gateway.
2. Asignar `status` en el servidor y dejar de exigirlo en el request.
3. Implementar idempotencia (`Idempotency-Key`) en `POST /reservations`.
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
