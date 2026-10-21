  # Funcionalidades del Frontend

## 1. Propósito

Este documento define el alcance funcional del frontend de TicketFlow: qué puede hacer el usuario
desde la interfaz, qué pantallas lo soportan y qué reglas de negocio debe reflejar la UI.

Sustituye, para este repo, al documento de épicas y features de plataforma
(`epicas_feactures.md`), que mezclaba funcionalidades de UI con capacidades internas de backend
(concurrencia atómica, mensajería, observabilidad, pruebas de carga). Esas capacidades **no** son
responsabilidad del frontend y no se documentan aquí.

Fuentes de este documento:

- `contexto_negocio.md`
- `requisitos/historias_usuarios.md` (HU-01 a HU-17)
- `requisitos/casos_uso.md` (CU-01 a CU-07)
- `diseno.md` (pantallas, componentes y estados)
- `contrato_api.md` (endpoints reales y huecos del backend)

> El frontend **no decide** la disponibilidad ni la validez de una reserva: solo la representa.
> La fuente de verdad es el backend (ver RB-12). La UI nunca debe mostrar como confirmada una
> reserva que el backend no confirmó.

---

## 2. Roles y permisos

| Rol | Alcance en la UI |
|---|---|
| Visitante (no autenticado) | Consultar eventos, buscar/filtrar, ver detalle y disponibilidad. Registrarse e iniciar sesión. |
| Comprador | Todo lo del visitante + crear reservas, consultar sus reservas, ver su detalle y cancelarlas. |
| Organizador | Todo lo del comprador + crear y editar eventos, definir localidades, precios y capacidades. |
| Administrador | Gestionar usuarios y roles. |

Reglas aplicables:

- **RB-04**: las operaciones protegidas requieren autenticación.
- **RB-05**: las operaciones administrativas dependen del rol del usuario.
- La UI debe **ocultar o deshabilitar** acciones no permitidas y, si el backend responde `403`,
  mostrar un estado de acceso denegado; nunca asumir permisos por el rol almacenado en el cliente.

---

## 3. Mapa de módulos

| Módulo | Pantallas | Roles |
|---|---|---|
| Autenticación y cuenta | Registro, inicio de sesión, perfil | Visitante, comprador, organizador, admin |
| Catálogo de eventos | Listado, búsqueda y filtros, detalle | Todos (consulta pública) |
| Disponibilidad | Selector de localidad y entradas (dentro del detalle) | Todos |
| Reservas | Crear reserva, mis reservas, detalle, cancelar | Comprador |
| Gestión de eventos | Mis eventos, crear, editar, localidades y capacidades | Organizador |
| Administración | Usuarios y roles | Administrador |

---

## 4. F1 — Autenticación y cuenta

### F1.1 Registro de usuario (HU-01 / CU-01)

- **Pantalla:** `/register`.
- **Acciones:** completar nombre, correo y contraseña; enviar; ir a iniciar sesión.
- **Datos:** nombre, correo, contraseña.
- **Reglas:** correo único (RB-02), datos válidos, contraseña no vacía. La UI valida formato
  antes de enviar y muestra los errores que devuelva el backend.
- **Estados:** éxito (mensaje + redirección a login), correo existente, datos inválidos, error de
  servicio.

### F1.2 Inicio de sesión (HU-02 / CU-02)

- **Pantalla:** `/login`.
- **Acciones:** ingresar correo y contraseña; enviar; cerrar sesión.
- **Reglas:** credenciales válidas; el token se adjunta a las peticiones protegidas.
- **Estados:** éxito (redirección al destino original o al catálogo), credenciales inválidas,
  sesión expirada (`401`), error de servicio.

### F1.3 Consulta de perfil (HU-03)

- **Pantalla:** `/profile`.
- **Acciones:** ver nombre, correo y rol.
- **Reglas:** solo el usuario autenticado puede ver su perfil.
- **Estados:** cargando, éxito, sesión expirada, error.

### F1.4 Gestión de roles (HU-03, administrador)

- **Pantalla:** `/admin/users` (ver F6).

---

## 5. F2 — Catálogo de eventos

### F2.1 Consultar eventos (HU-05 / CU-04)

- **Pantalla:** `/` (listado).
- **Acciones:** ver tarjetas/lista de eventos; abrir detalle; paginar.
- **Datos:** nombre, fecha, lugar, categoría, precio desde, imagen (si existe).
- **Reglas:** la consulta pública no requiere autenticación.
- **Estados:** cargando (skeleton), vacío, error con reintento, éxito.

### F2.2 Buscar y filtrar (HU-06)

- **Pantalla:** `/` (barra de búsqueda + filtros).
- **Acciones:** buscar por texto; filtrar por categoría y fecha; limpiar filtros.
- **Reglas:** los filtros se reflejan en la URL para poder compartir/recargar el resultado.
- **Estados:** sin resultados (empty state con opción de limpiar filtros), error.

### F2.3 Consultar detalle del evento (HU-07)

- **Pantalla:** `/events/:eventId`.
- **Acciones:** ver descripción, fecha, lugar, categoría, organizador, localidades, precios y
  disponibilidad; iniciar reserva.
- **Datos:** información estática del evento + disponibilidad actual por localidad.
- **Reglas:** si el evento no existe, mostrar `404`; si no hay disponibilidad, deshabilitar la
  reserva.
- **Estados:** cargando, éxito, evento no encontrado, error de servicio.

---

## 6. F3 — Disponibilidad

### F3.1 Consultar disponibilidad (HU-09, HU-14 / CU-05)

- **Ubicación:** sección de localidades dentro del detalle del evento.
- **Acciones:** ver entradas restantes por localidad; refrescar.
- **Datos:** localidad, precio, disponibilidad actual.
- **Reglas:** la UI **no calcula** disponibilidad; la muestra tal como la entrega el backend
  (RB-12). Debe indicar de forma visible cuando está agotada.
- **Estados:** cargando, disponible, agotado, no disponible temporalmente (error), actualizando.

---

## 7. F4 — Reservas

### F4.1 Crear reserva (HU-12 / CU-06)

- **Ubicación:** panel/modal de reserva desde el detalle del evento.
- **Acciones:** elegir localidad; elegir cantidad; confirmar; ver resultado.
- **Datos:** evento, localidad, cantidad.
- **Reglas:**
  - La cantidad debe ser mayor que cero y no superar la disponibilidad mostrada (RB-08, RB-09).
  - El botón de confirmar se deshabilita mientras la petición está en curso (evita doble envío).
  - Solo se muestra como confirmada si el backend responde éxito (RB-11).
  - Si el backend rechaza por falta de disponibilidad (`409`), se informa y se refresca la
    disponibilidad; nunca se simula una reserva exitosa.
- **Estados:** éxito (resumen + actualización de disponibilidad), sin disponibilidad, datos
  inválidos, sesión expirada, error de servicio.

### F4.2 Consultar mis reservas (HU-15)

- **Pantalla:** `/reservations`.
- **Acciones:** ver historial; abrir detalle; cancelar.
- **Datos:** evento, localidad, cantidad, estado, fecha.
- **Reglas:** solo se muestran las reservas del usuario autenticado.
- **Estados:** cargando, vacío, error, sesión expirada.

### F4.3 Consultar detalle de reserva (HU-16)

- **Pantalla:** `/reservations/:reservationId`.
- **Acciones:** ver información completa; cancelar si aplica.
- **Reglas:** la reserva debe pertenecer al usuario; si no, `403`/`404`.
- **Estados:** cargando, éxito, no encontrada, acceso denegado, error.

### F4.4 Cancelar reserva (HU-17 / CU-07)

- **Ubicación:** detalle/listado de reservas.
- **Acciones:** solicitar cancelación; confirmar en un diálogo.
- **Reglas:** solo si la reserva permite cancelación; tras cancelar se libera disponibilidad
  (responsabilidad del backend) y la UI refresca el estado.
- **Estados:** confirmación, éxito, no cancelable, error.

---

## 8. F5 — Gestión de eventos (organizador)

### F5.1 Crear evento (HU-04 / CU-03)

- **Pantallas:** `/organizer/events/new`.
- **Acciones:** completar datos del evento; agregar localidades con precio y capacidad; guardar.
- **Datos:** nombre, descripción, fecha, lugar, categoría, localidades, precio, capacidad.
- **Reglas:** datos obligatorios; capacidad mayor que cero (RB-07); precio no negativo; el
  organizador debe estar autenticado y tener el rol (RB-06).
- **Estados:** éxito (redirección a mis eventos), validación, sin permisos, error.

### F5.2 Modificar evento (HU-08)

- **Pantalla:** `/organizer/events/:eventId/edit`.
- **Acciones:** editar datos, localidades, precios y capacidades; guardar.
- **Reglas:** solo el organizador autorizado; cambios de capacidad afectan la disponibilidad
  (lógica del backend) y la UI debe advertirlo.
- **Estados:** éxito, validación, no encontrado, sin permisos, error.

### F5.3 Configurar localidades (HU-10)

- **Ubicación:** sección dentro del formulario de evento (`/organizer/events/:eventId/localities`
  o paso del asistente).
- **Acciones:** agregar, editar y quitar localidades antes de guardar.
- **Reglas:** nombre de localidad obligatorio y no vacío; no duplicar localidades.
- **Estados:** vacío (sin localidades), edición, validación.

### F5.4 Configurar capacidad y precio (HU-11)

- **Ubicación:** por localidad, dentro del formulario de evento.
- **Acciones:** definir capacidad total y precio.
- **Reglas:** capacidad entera mayor que cero (RB-07); precio mayor o igual que cero.
- **Estados:** validación, éxito.

### F5.5 Mis eventos

- **Pantalla:** `/organizer/events`.
- **Acciones:** ver los eventos del organizador; crear; editar.
- **Estados:** cargando, vacío (invitar a crear el primero), error, sin permisos.

---

## 9. F6 — Administración de usuarios

### F6.1 Gestionar roles

- **Pantalla:** `/admin/users`.
- **Acciones:** listar usuarios; cambiar rol; confirmar.
- **Reglas:** solo administrador (RB-05); la UI confirma antes de cambiar un rol y refresca el
  estado con la respuesta del backend.
- **Estados:** cargando, vacío, éxito, sin permisos, error.

> El alcance de roles del prototipo es comprador, organizador y administrador. Cualquier otro rol
> (por ejemplo, staff de check-in) requiere definición previa en `contexto` y una decisión.

---

## 10. Flujos principales

### 10.1 Flujo de compra

1. El visitante entra al listado de eventos.
2. Busca o filtra y abre el detalle.
3. Consulta localidades y disponibilidad.
4. Selecciona localidad y cantidad.
5. Si no tiene sesión, inicia sesión conservando el evento y la selección.
6. Confirma la reserva.
7. La UI muestra el resultado y actualiza la disponibilidad.
8. El comprador puede ver la reserva en "Mis reservas" y cancelarla si aplica.

### 10.2 Flujo de organización

1. El organizador inicia sesión.
2. Entra a "Mis eventos" y crea un evento.
3. Completa datos, localidades, precios y capacidades.
4. Guarda y verifica el evento en el listado público (si se publica).
5. Puede editarlo después; la UI advierte el impacto de cambiar capacidades.

### 10.3 Flujo de administración

1. El administrador inicia sesión.
2. Entra a "Usuarios".
3. Busca al usuario, cambia su rol y confirma.
4. La UI refleja el nuevo rol.

---

## 11. Prioridad

| Prioridad | Funcionalidades |
|---|---|
| **MVP** | F1.1, F1.2, F1.3, F2.1, F2.3, F3.1, F4.1, F4.2 |
| **Siguiente** | F2.2 (búsqueda/filtros), F4.3, F4.4, F5.1, F5.3, F5.4, F5.5 |
| **Posterior** | F5.2, F6.1 |

La prioridad es una propuesta de alcance, no una decisión aprobada. Debe validarse contra el
tiempo del prototipo (seis semanas) y las dependencias de backend disponibles.

---

## 12. Fuera de alcance del frontend

- Pagos reales, facturación y procesamiento de tarjetas.
- Emisión real de entradas y códigos QR.
- Notificaciones por correo o SMS.
- Recomendaciones personalizadas.
- Aplicación móvil nativa.
- Pruebas de carga y análisis de rendimiento del backend.
- Decisiones de arquitectura de microservicios, inventario, caché o mensajería.

Estas capacidades pertenecen al backend o están fuera del alcance del prototipo; el frontend solo
las refleja si el backend las expone.
