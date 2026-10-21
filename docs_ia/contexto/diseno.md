# Diseño de Interfaz (UI/UX)

## 1. Propósito y alcance

Este documento define el diseño de experiencia e interfaz del frontend de TicketFlow: principios,
navegación, pantallas, componentes, estados y reglas de interacción.

**No define** el stack, la librería de componentes, el sistema de diseño visual ni la identidad de
marca. Esas son decisiones pendientes (`DA-xxx`) y no deben asumirse. Aquí se describe **qué** debe
poder hacer y ver el usuario, no **con qué** tecnología se implementa.

Fuentes: `contexto_negocio.md`, `funcionalidades.md`, `requisitos/historias_usuarios.md`,
`requisitos/casos_uso.md`, `calidad/atributos_calidad.md` y `calidad/escenarios_calidad.md`.

---

## 2. Principios de diseño

1. **La disponibilidad manda.** La UI nunca inventa, estima ni cachea disponibilidad como si fuera
   definitiva. Muestra el dato del backend y lo refresca antes de reservar.
2. **Nunca prometer una reserva que no existe.** El éxito solo se muestra con confirmación del
   backend. Un `409` es un resultado normal, no un error técnico.
3. **Claridad antes que adornos.** Mensajes explícitos, sin jerga técnica, con la acción siguiente.
4. **Rápido de percibir.** Skeletons y estados de carga en lugar de pantallas en blanco; búsqueda
   con debounce; no bloquear la UI mientras se consulta.
5. **A prueba de doble clic.** Las acciones que crean o cancelan recursos se deshabilitan mientras
   están en curso.
6. **Accesible por defecto.** Navegación por teclado, foco visible, etiquetas y mensajes
   anunciados.
7. **Mobile-first y responsive.** El flujo de compra debe funcionar en pantallas pequeñas.
8. **Consistencia.** Los mismos patrones para formularios, errores, confirmaciones y estados.
9. **Prevención de errores.** Validar antes de enviar, confirmar acciones destructivas y explicar
   las restricciones (por ejemplo, capacidad).
10. **Sesión explícita.** Si la sesión expira, se informa y se redirige conservando la intención.

---

## 3. Arquitectura de información y navegación

```
Inicio / Eventos (/)
├── Detalle de evento (/events/:eventId)
│   └── Reserva (panel/modal)
├── Iniciar sesión (/login)
├── Registro (/register)
├── Perfil (/profile)
├── Mis reservas (/reservations)
│   └── Detalle de reserva (/reservations/:reservationId)
├── Organizador
│   ├── Mis eventos (/organizer/events)
│   ├── Crear evento (/organizer/events/new)
│   └── Editar evento (/organizer/events/:eventId/edit)
│       └── Localidades y capacidades (sección o paso)
└── Administración
    └── Usuarios y roles (/admin/users)
```

Navegación:

- **Visitante:** logo/inicio, eventos, iniciar sesión, registrarse.
- **Autenticado:** además, perfil, mis reservas y cerrar sesión.
- **Organizador:** además, "Mis eventos".
- **Administrador:** además, "Usuarios".

Las rutas son una **propuesta** de estructura; su implementación concreta depende del stack
(pendiente de decisión).

---

## 4. Inventario de pantallas

| ID | Pantalla | Ruta propuesta | Rol | Propósito | Estados clave |
|---|---|---|---|---|---|
| P-01 | Listado de eventos | `/` | Todos | Descubrir eventos | Cargando, vacío, error |
| P-02 | Búsqueda y filtros | `/` (integrado) | Todos | Acotar resultados | Sin resultados |
| P-03 | Detalle de evento | `/events/:eventId` | Todos | Información + disponibilidad | Cargando, 404, error |
| P-04 | Registro | `/register` | Visitante | Crear cuenta | Validación, correo existente |
| P-05 | Inicio de sesión | `/login` | Visitante | Autenticarse | Credenciales inválidas, 401 |
| P-06 | Perfil | `/profile` | Autenticado | Ver cuenta | Cargando, 401 |
| P-07 | Panel de reserva | Modal/panel en P-03 | Comprador | Elegir localidad y cantidad | Validación, 409, 503 |
| P-08 | Mis reservas | `/reservations` | Comprador | Historial | Cargando, vacío, error |
| P-09 | Detalle de reserva | `/reservations/:reservationId` | Comprador | Ver/cancelar | 404, 403, cancelable |
| P-10 | Mis eventos | `/organizer/events` | Organizador | Gestionar eventos | Vacío, error, 403 |
| P-11 | Crear evento | `/organizer/events/new` | Organizador | Alta de evento | Validación, 403 |
| P-12 | Editar evento | `/organizer/events/:eventId/edit` | Organizador | Modificar evento | 404, 403, validación |
| P-13 | Localidades y capacidades | Sección/paso de P-11/P-12 | Organizador | Configurar inventario | Validación |
| P-14 | Usuarios y roles | `/admin/users` | Administrador | Gestionar roles | Cargando, 403 |
| P-15 | No encontrado | `*` | Todos | 404 | — |
| P-16 | Acceso denegado | `*` | Todos | 403 | — |
| P-17 | Servicio no disponible | `*` | Todos | 503 / fallback | Reintento |

---

## 5. Componentes de interfaz

Inventario conceptual (los nombres son orientativos y deberán adaptarse al stack elegido):

### Layout
- `AppShell` (header + contenido + footer)
- `Header` / `Nav` (navegación según rol)
- `Breadcrumbs`
- `SkipLink` (accesibilidad)

### Autenticación y cuenta
- `LoginForm`
- `RegisterForm`
- `PasswordField`
- `SessionGuard` (protege rutas privadas)
- `UserMenu` (perfil, cerrar sesión)

### Eventos
- `EventList` / `EventGrid`
- `EventCard`
- `SearchBar`
- `EventFilters` (categoría, fecha, lugar)
- `EventDetail`
- `LocalityList` / `LocalitySelector`
- `PriceTag`
- `AvailabilityBadge` (disponible / agotado / última actualización)

### Reservas
- `QuantitySelector`
- `ReservationSummary`
- `ReservationConfirmation`
- `ReservationCard`
- `ReservationStatusBadge`
- `ReservationList`
- `CancelReservationDialog`

### Organizador
- `EventForm`
- `LocalityEditor` (agregar/editar/quitar)
- `CapacityInput`
- `PriceInput`

### Administración
- `UserTable`
- `RoleSelector`
- `RoleChangeDialog`

### Feedback y estados
- `Skeleton`
- `Spinner`
- `EmptyState`
- `ErrorState` (con reintento)
- `Alert`
- `Toast`
- `ConfirmDialog`
- `Pagination`
- `LiveRegion` (anuncios accesibles)

### Formularios
- `FormField`
- `TextInput`
- `NumberInput`
- `DateInput`
- `Select`
- `ValidationMessage`
- `FormErrorSummary`

---

## 6. Patrones de interacción

### 6.1 Autenticación

- El registro valida nombre, correo y contraseña antes de enviar.
- El login muestra un error genérico ante credenciales inválidas (no revelar si el correo existe).
- Al iniciar sesión se redirige al destino original (por ejemplo, el evento que se estaba viendo).
- Si una petición protegida responde `401`, se limpia la sesión y se redirige a login con un
  mensaje de sesión expirada, conservando la intención cuando sea posible.
- El cierre de sesión limpia el estado local y vuelve al catálogo.

### 6.2 Búsqueda y filtros

- La búsqueda se ejecuta con debounce (propuesta: 300 ms) y se refleja en la URL.
- Los filtros se pueden limpiar con una acción visible.
- Si no hay resultados, se muestra un empty state con "Limpiar filtros".
- La paginación conserva búsqueda y filtros.

### 6.3 Consulta de disponibilidad

- El detalle del evento muestra la disponibilidad por localidad.
- Se indica la hora de la última actualización.
- Las localidades agotadas se muestran como no seleccionables.
- Antes de confirmar una reserva, la UI refresca la disponibilidad.

### 6.4 Creación de reserva

1. El usuario elige localidad y cantidad.
2. La UI valida cantidad (`> 0`, `<= disponible`, entero).
3. El botón "Reservar" se deshabilita al enviar y muestra estado de carga.
4. Resultado:
   - **Éxito:** resumen de la reserva, actualización de disponibilidad y acceso a "Mis reservas".
   - **`409` sin disponibilidad:** mensaje claro, se refresca la disponibilidad y se ajusta la
     cantidad máxima.
   - **`401`:** redirección a login conservando la selección.
   - **`503`/timeout:** estado de error con opción de reintentar; nunca mostrar éxito.
5. No se permite enviar dos veces la misma reserva por doble clic.

### 6.5 Cancelación

- Se solicita confirmación explícita en un diálogo.
- El botón de confirmar se deshabilita mientras se procesa.
- Al cancelar, se actualiza el estado de la reserva y, si aplica, la disponibilidad mostrada.

### 6.6 Gestión de eventos

- El formulario agrupa datos del evento y localidades.
- Se puede agregar, editar y quitar localidades antes de guardar.
- Se valida capacidad (`> 0`) y precio (`>= 0`).
- Al editar una capacidad existente se advierte que el cambio afecta la disponibilidad.
- Si el guardado falla, se conservan los datos ingresados y se muestran los errores.

### 6.7 Administración de roles

- La tabla de usuarios permite buscar y ver el rol actual.
- Cambiar rol requiere confirmación y muestra el resultado del backend.
- Un usuario sin rol administrador no ve la sección.

---

## 7. Formularios y validación

- Validación en cliente para formato y campos obligatorios; validación definitiva en servidor.
- Los errores se muestran junto al campo y en un resumen al inicio del formulario.
- No se pierde lo ingresado ante un error de validación o de red.
- Reglas mínimas:
  - Nombre: obligatorio, no vacío.
  - Correo: obligatorio, formato válido.
  - Contraseña: obligatoria; la longitud mínima queda pendiente de definición.
  - Evento: nombre, fecha, lugar y categoría obligatorios.
  - Localidad: nombre obligatorio y no duplicado.
  - Capacidad: entero `> 0`.
  - Precio: `>= 0`.
  - Cantidad de reserva: entero `> 0` y `<= disponibilidad`.
- Los mensajes deben explicar **qué corregir**, no solo que "algo falló".

---

## 8. Estados de interfaz

| Estado | Cuándo | Comportamiento |
|---|---|---|
| Cargando | Consulta en curso | Skeleton o spinner; no bloquear toda la pantalla si es parcial |
| Vacío | Sin datos | Empty state con acción sugerida |
| Error | Fallo de red o `5xx` | Mensaje, detalle útil y botón de reintentar |
| `401` | Sesión ausente/expirada | Redirigir a login conservando intención |
| `403` | Sin permisos | Pantalla o mensaje de acceso denegado; ocultar acciones |
| `404` | Recurso inexistente | Pantalla "no encontrado" con enlace al inicio |
| `409` | Conflicto (sin disponibilidad) | Mensaje de negocio + refrescar disponibilidad |
| `503` | Servicio no disponible | Estado de indisponibilidad + reintento |
| Éxito | Operación completada | Confirmación visible y actualización de datos |
| En curso | Acción enviada | Botón deshabilitado + indicador |

---

## 9. Accesibilidad

Requisitos mínimos:

- HTML semántico y jerarquía de encabezados correcta.
- Todos los campos con etiqueta asociada; los errores anunciados.
- Navegación completa por teclado; foco visible.
- Foco atrapado en diálogos y devuelto al elemento de origen al cerrar.
- `aria-live` para resultados asíncronos (éxito, error, actualización de disponibilidad).
- Contraste suficiente y estados que no dependan solo del color.
- Textos alternativos en imágenes.
- Áreas táctiles adecuadas en móvil.

**Objetivo acordado (2026-10-20): WCAG 2.1 AA.** Registrado en `DA-001` (aún en estado
`PROPUESTA`); los criterios de arriba se aplican como mínimo.

---

## 10. Responsive

- Enfoque mobile-first.
- Puntos de quiebre propuestos: 360 px, 768 px, 1024 px, 1280 px (pendientes de validación).
- Las tablas se convierten en tarjetas o listas en pantallas pequeñas.
- Los filtros se colapsan en un panel en móvil.
- El panel de reserva ocupa la pantalla completa en móvil y un modal/panel lateral en escritorio.
- Sin scroll horizontal en el flujo de compra.

---

## 11. Contenido y tono

- Idioma de la interfaz: español.
- Tono directo, claro y sin jerga técnica.
- Mensajes de negocio explícitos:
  - Sin disponibilidad: "No hay suficientes entradas disponibles para esta localidad.
    Actualizamos la disponibilidad."
  - Servicio no disponible: "No pudimos completar la operación. Intenta de nuevo en unos
    momentos."
  - Sesión expirada: "Tu sesión expiró. Inicia sesión para continuar."
  - Éxito: "Reserva confirmada" + resumen.
- No usar mensajes que prometan resultados no confirmados.

---

## 12. Decisiones pendientes

| Tema | Estado |
|---|---|
| Stack y framework del frontend | `DA-001` (PROPUESTA: Next.js + TypeScript) |
| Sistema de diseño / identidad visual (colores, tipografía, tokens) | Base neutral shadcn/ui acordada; tokens pendientes |
| Librería de componentes | `DA-001` (PROPUESTA: shadcn/ui) |
| Gestión de estado y fetching de datos | `DA-001` (PROPUESTA: TanStack Query + Zustand) |
| Estrategia de autenticación en el cliente (almacenamiento del token) | Cookie `httpOnly` + BFF (DA-001, 2026-10-20) |
| Nivel de accesibilidad objetivo | WCAG 2.1 AA (acordado 2026-10-20) |
| Herramientas de pruebas | `DA-001` (PROPUESTA: Vitest + RTL + Playwright) |
| Contrato de consumo del gateway y endpoints definitivos | `contexto/contrato_api.md` (rama `main`) |

> Ninguna de estas decisiones se toma en este documento. Cualquier propuesta debe registrarse en
> `docs_ia/decisiones` y esperar aprobación humana.
