# Historias de Usuario (Frontend)

## 1. Convención

Las historias usan la estructura:

Como [actor]
Quiero [funcionalidad]
Para [beneficio]

Los criterios de aceptación usan Gherkin (Dado / Cuando / Entonces). Cada historia incluye una
sección **Implicación UI** que indica qué debe construir y mostrar el frontend.

> Este documento conserva las historias de plataforma que tienen impacto en la interfaz
> (HU-01 a HU-17). Se excluyeron las historias de evaluación de rendimiento (HU-18 a HU-20),
> porque pertenecen al backend y no se implementan desde este repositorio.

---

# 2. Gestión de usuarios

## HU-01 - Registrar usuario

**Como** comprador u organizador

**Quiero** registrarme en el sistema

**Para** poder utilizar las funcionalidades correspondientes a mi rol.

### Criterios de aceptación

#### Escenario 1 - Registro exitoso

Given que el usuario no está registrado
When proporciona nombre, correo y contraseña válidos
Then el sistema debe crear el usuario.

#### Escenario 2 - Correo existente

Given que existe un usuario con el correo proporcionado
When otro usuario intenta registrarse con el mismo correo
Then el sistema debe rechazar el registro.

#### Escenario 3 - Datos inválidos

Given que el usuario proporciona información inválida
When intenta registrarse
Then el sistema debe informar que los datos no cumplen las reglas requeridas.

### Implicación UI

- Formulario en `/register` con nombre, correo y contraseña.
- Validación en cliente y mensajes por campo.
- Mensaje claro para correo existente.
- Redirección a inicio de sesión tras el éxito.

---

## HU-02 - Iniciar sesión

**Como** usuario registrado

**Quiero** iniciar sesión

**Para** acceder a las funcionalidades correspondientes a mi rol.

### Criterios de aceptación

#### Escenario 1 - Credenciales válidas

Given que el usuario está registrado
When proporciona credenciales válidas
Then el sistema debe autenticarlo y generar un token de acceso.

#### Escenario 2 - Credenciales inválidas

Given que el usuario proporciona credenciales incorrectas
When intenta iniciar sesión
Then el sistema debe rechazar la autenticación.

### Implicación UI

- Formulario en `/login`.
- Error genérico ante credenciales inválidas.
- Redirección al destino original o al catálogo.
- Manejo de sesión expirada (`401`) con redirección a login.

---

## HU-03 - Consultar perfil

**Como** usuario autenticado

**Quiero** consultar mi perfil

**Para** conocer la información asociada a mi cuenta.

### Criterios de aceptación

#### Escenario 1

Given que el usuario está autenticado
When solicita su perfil
Then el sistema debe retornar su información básica.

### Implicación UI

- Pantalla `/profile` con nombre, correo y rol.
- Ruta protegida; `401` redirige a login.
- El rol mostrado determina las opciones de navegación visibles.

---

# 3. Gestión de eventos

## HU-04 - Crear evento

**Como** organizador

**Quiero** crear un evento

**Para** publicar una actividad que pueda ser consultada por los compradores.

### Criterios de aceptación

#### Escenario 1

Given que el organizador está autenticado
When proporciona los datos requeridos del evento
Then el sistema debe crear el evento.

#### Escenario 2

Given que faltan datos obligatorios
When el organizador intenta crear el evento
Then el sistema debe rechazar la operación.

### Implicación UI

- Formulario en `/organizer/events/new`.
- Campos obligatorios y validación antes de enviar.
- Sección de localidades con precio y capacidad.
- Solo visible para organizadores.

---

## HU-05 - Consultar eventos

**Como** comprador

**Quiero** consultar los eventos disponibles

**Para** seleccionar un evento de mi interés.

### Criterios de aceptación

#### Escenario 1

Given que existen eventos registrados
When el comprador consulta los eventos
Then el sistema debe retornar los eventos disponibles.

### Implicación UI

- Listado público en `/`.
- Tarjetas con nombre, fecha, lugar, categoría y precio desde.
- Estados de carga, vacío y error.

---

## HU-06 - Buscar y filtrar eventos

**Como** comprador

**Quiero** buscar y filtrar eventos

**Para** encontrar rápidamente los eventos de mi interés.

### Criterios de aceptación

#### Escenario 1

Given que existen múltiples eventos
When el comprador aplica un criterio de búsqueda
Then el sistema debe retornar los eventos que coincidan.

#### Escenario 2

Given que existen eventos con diferentes categorías o fechas
When el comprador aplica filtros
Then el sistema debe retornar únicamente los eventos que cumplan los filtros.

### Implicación UI

- Barra de búsqueda con debounce.
- Filtros por categoría y fecha.
- Filtros reflejados en la URL.
- Empty state con opción de limpiar filtros.

---

## HU-07 - Consultar detalle del evento

**Como** comprador

**Quiero** consultar el detalle de un evento

**Para** conocer sus características antes de reservar.

### Criterios de aceptación

#### Escenario 1

Given que el evento existe
When el comprador solicita su detalle
Then el sistema debe retornar la información del evento.

### Implicación UI

- Pantalla `/events/:eventId` con descripción, fecha, lugar, categoría y organizador.
- Sección de localidades con precio y disponibilidad.
- Acción de reservar (deshabilitada si no hay disponibilidad).
- `404` si el evento no existe.

---

## HU-08 - Modificar evento

**Como** organizador

**Quiero** modificar un evento

**Para** mantener actualizada su información.

### Criterios de aceptación

#### Escenario 1

Given que el organizador tiene permisos
When modifica información válida del evento
Then el sistema debe actualizar la información.

### Implicación UI

- Pantalla `/organizer/events/:eventId/edit`.
- Solo el organizador autorizado.
- Advertencia al cambiar capacidades.
- Conservar datos ingresados si falla el guardado.

---

# 4. Gestión de inventario

## HU-09 - Consultar disponibilidad

**Como** comprador

**Quiero** consultar la disponibilidad de entradas

**Para** conocer cuántas entradas puedo reservar.

### Criterios de aceptación

#### Escenario 1

Given que existe un evento con localidades configuradas
When el comprador consulta la disponibilidad
Then el sistema debe mostrar la disponibilidad actual.

### Implicación UI

- Disponibilidad por localidad en el detalle del evento.
- Indicador de agotado y de última actualización.
- La UI no calcula la disponibilidad.

---

## HU-10 - Configurar localidades

**Como** organizador

**Quiero** configurar las localidades de un evento

**Para** definir las opciones disponibles para los compradores.

### Criterios de aceptación

#### Escenario 1

Given que el organizador está creando un evento
When define una localidad válida
Then el sistema debe registrar la localidad.

### Implicación UI

- Editor de localidades dentro del formulario de evento.
- Agregar, editar y quitar localidades antes de guardar.
- Validación de nombre obligatorio y no duplicado.

---

## HU-11 - Configurar capacidad

**Como** organizador

**Quiero** definir la capacidad de una localidad

**Para** establecer la cantidad máxima de entradas disponibles.

### Criterios de aceptación

#### Escenario 1

Given que existe una localidad
When el organizador establece una capacidad válida
Then el sistema debe registrar la capacidad total.

### Implicación UI

- Campo de capacidad por localidad.
- Validación: entero mayor que cero.
- Aviso de impacto al modificar una capacidad existente.

---

# 5. Gestión de reservas

## HU-12 - Crear reserva

**Como** comprador

**Quiero** reservar entradas

**Para** asegurar mi participación en un evento.

### Criterios de aceptación

#### Escenario 1 - Reserva exitosa

Given que existe disponibilidad suficiente
When el comprador solicita una cantidad válida de entradas
Then el sistema debe crear la reserva
And debe disminuir la disponibilidad correspondiente.

#### Escenario 2 - Sin disponibilidad

Given que no existe disponibilidad suficiente
When el comprador intenta realizar una reserva
Then el sistema debe rechazar la reserva.

### Implicación UI

- Selector de localidad y cantidad.
- Validación de cantidad (`> 0`, `<= disponible`, entero).
- Botón deshabilitado durante el envío (evita doble reserva).
- Éxito solo con confirmación del backend; `409` se informa y refresca disponibilidad.

---

## HU-13 - Evitar sobreventa

**Como** sistema

**Quiero** controlar las operaciones concurrentes

**Para** evitar asignar más entradas de las disponibles.

### Criterios de aceptación

#### Escenario 1 - Una entrada disponible

Given que existe una sola entrada disponible
And existen dos solicitudes concurrentes
When ambas intentan reservar la entrada
Then únicamente una solicitud debe ser aceptada
And la otra debe ser rechazada
And la disponibilidad final debe ser cero.

#### Escenario 2 - Múltiples reservas simultáneas

Given que existe una cantidad limitada de entradas
When múltiples usuarios realizan reservas simultáneas
Then el sistema no debe superar la capacidad disponible.

### Implicación UI

- La UI no decide la concurrencia; representa el resultado.
- Ante rechazo, mensaje claro y refresco de disponibilidad.
- Nunca mostrar éxito sin confirmación del backend.
- Evitar dobles envíos desde la interfaz.

---

## HU-14 - Consultar disponibilidad actualizada

**Como** comprador

**Quiero** consultar la disponibilidad actual

**Para** conocer el inventario antes de reservar.

### Criterios de aceptación

#### Escenario 1

Given que existen cambios en el inventario
When el comprador consulta la disponibilidad
Then el sistema debe retornar el estado actualizado.

### Implicación UI

- Refrescar disponibilidad al abrir el detalle y antes de confirmar.
- Indicar la hora de la última actualización.
- Actualizar la vista tras reservar o cancelar.

---

## HU-15 - Consultar mis reservas

**Como** comprador

**Quiero** consultar mis reservas

**Para** conocer las reservas realizadas.

### Criterios de aceptación

#### Escenario 1

Given que el comprador tiene reservas
When consulta su historial
Then el sistema debe retornar sus reservas.

### Implicación UI

- Pantalla `/reservations`.
- Lista con evento, localidad, cantidad, estado y fecha.
- Estados de carga, vacío y error.
- Acceso al detalle y a cancelar cuando aplique.

---

## HU-16 - Consultar detalle de reserva

**Como** comprador

**Quiero** consultar el detalle de una reserva

**Para** conocer la información asociada.

### Criterios de aceptación

#### Escenario 1

Given que la reserva pertenece al comprador
When solicita el detalle
Then el sistema debe retornar la información de la reserva.

### Implicación UI

- Pantalla `/reservations/:reservationId`.
- `403`/`404` si no pertenece al usuario o no existe.
- Acción de cancelar si el estado lo permite.

---

## HU-17 - Cancelar reserva

**Como** comprador

**Quiero** cancelar una reserva

**Para** liberar las entradas cuando corresponda.

### Criterios de aceptación

#### Escenario 1

Given que la reserva puede ser cancelada
When el comprador solicita la cancelación
Then el sistema debe cambiar el estado de la reserva
And debe liberar las entradas correspondientes.

### Implicación UI

- Diálogo de confirmación antes de cancelar.
- Botón deshabilitado mientras se procesa.
- Actualización del estado y de la disponibilidad tras la cancelación.

---

# 6. Trazabilidad

| Historia | Funcionalidad | Caso de uso |
|---|---|---|
| HU-01 | F1.1 | CU-01 |
| HU-02 | F1.2 | CU-02 |
| HU-03 | F1.3 | — |
| HU-04 | F5.1 | CU-03 |
| HU-05 | F2.1 | CU-04 |
| HU-06 | F2.2 | — |
| HU-07 | F2.3 | — |
| HU-08 | F5.2 | — |
| HU-09 | F3.1 | CU-05 |
| HU-10 | F5.3 | — |
| HU-11 | F5.4 | — |
| HU-12 | F4.1 | CU-06 |
| HU-13 | F4.1 | CU-06 (FA-02) |
| HU-14 | F3.1 | CU-05 |
| HU-15 | F4.2 | — |
| HU-16 | F4.3 | — |
| HU-17 | F4.4 | CU-07 |
