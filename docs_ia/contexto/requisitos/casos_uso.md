# Casos de Uso (Frontend)

## 1. Propósito

Este documento describe los flujos de usuario que el frontend debe soportar, desde la perspectiva
de la interfaz. Complementa a `historias_usuarios.md`.

Cada caso de uso incluye actor, objetivo, precondiciones, flujo principal, flujos alternativos y
postcondición. Los pasos describen lo que ve y hace el usuario; la lógica interna del backend no se
detalla aquí.

> Se excluyeron los casos de uso de pruebas de carga, detección de anomalías y análisis de
> resultados (CU-08 a CU-10), porque no son funcionalidades de la interfaz.

---

# CU-01 - Registrar usuario

## Actor principal

Comprador u organizador (visitante).

## Objetivo

Crear una cuenta en el sistema.

## Precondiciones

- El usuario no está autenticado.
- No existe una cuenta con el mismo correo.

## Flujo principal

1. El usuario abre `/register`.
2. Completa nombre, correo y contraseña.
3. La UI valida los campos.
4. El usuario envía el formulario.
5. El sistema crea la cuenta.
6. La UI informa el éxito y redirige a iniciar sesión.

## Flujos alternativos

### FA-01 - Correo existente

1. El sistema detecta que el correo ya está registrado.
2. La UI muestra el mensaje junto al campo.
3. El usuario corrige el correo o decide iniciar sesión.

### FA-02 - Datos inválidos

1. La UI detecta campos inválidos antes de enviar (o el sistema los rechaza).
2. Se muestran los errores por campo y un resumen.
3. El usuario corrige y reintenta.

## Postcondición

El usuario queda registrado y puede iniciar sesión.

---

# CU-02 - Iniciar sesión

## Actor principal

Usuario registrado.

## Objetivo

Autenticarse y acceder a las funcionalidades de su rol.

## Precondiciones

- El usuario está registrado.

## Flujo principal

1. El usuario abre `/login`.
2. Ingresa correo y contraseña.
3. Envía el formulario.
4. El sistema valida las credenciales y devuelve el acceso.
5. La UI redirige al destino original o al catálogo.
6. La navegación se ajusta al rol.

## Flujos alternativos

### FA-01 - Credenciales inválidas

1. El sistema rechaza la autenticación.
2. La UI muestra un error genérico y permite reintentar.

### FA-02 - Sesión expirada durante una acción

1. Una petición protegida responde `401`.
2. La UI informa que la sesión expiró y redirige a login.
3. Tras autenticarse, se retoma la intención cuando sea posible.

## Postcondición

El usuario tiene una sesión activa y ve las opciones de su rol.

---

# CU-03 - Crear evento

## Actor principal

Organizador.

## Objetivo

Registrar un nuevo evento con sus localidades, precios y capacidades.

## Precondiciones

- El usuario está autenticado.
- El usuario tiene rol de organizador.

## Flujo principal

1. El organizador abre "Mis eventos" y elige crear.
2. Completa los datos del evento.
3. Agrega una o más localidades con precio y capacidad.
4. La UI valida los campos.
5. Envía el formulario.
6. El sistema registra el evento.
7. La UI confirma y redirige a "Mis eventos".

## Flujos alternativos

### FA-01 - Datos faltantes o inválidos

1. La UI marca los campos con error.
2. No se envía la solicitud hasta corregirlos.

### FA-02 - Sin permisos

1. El sistema responde `403`.
2. La UI muestra acceso denegado.

## Postcondición

El evento queda registrado y visible para el organizador.

---

# CU-04 - Consultar eventos

## Actor principal

Comprador (o visitante).

## Objetivo

Obtener los eventos disponibles.

## Precondiciones

- Ninguna; la consulta pública no requiere autenticación.

## Flujo principal

1. El usuario abre el catálogo.
2. La UI muestra el listado (o skeletons mientras carga).
3. El usuario puede buscar, filtrar y paginar.
4. Selecciona un evento y abre su detalle.

## Flujos alternativos

### FA-01 - Sin resultados

1. La UI muestra un empty state.
2. Ofrece limpiar filtros.

### FA-02 - Error de consulta

1. La UI muestra un estado de error con reintento.

## Postcondición

El usuario visualiza los eventos que cumplen sus criterios.

---

# CU-05 - Consultar disponibilidad

## Actor principal

Comprador.

## Objetivo

Conocer las entradas disponibles por localidad.

## Precondiciones

- El evento existe.

## Flujo principal

1. El usuario abre el detalle del evento.
2. La UI consulta la disponibilidad.
3. Muestra cada localidad con precio y entradas restantes.
4. Indica la hora de la última actualización.
5. Las localidades agotadas aparecen como no seleccionables.

## Flujos alternativos

### FA-01 - Disponibilidad no disponible temporalmente

1. La consulta falla.
2. La UI muestra un aviso y permite reintentar; no inventa valores.

## Postcondición

El usuario conoce la disponibilidad actual.

---

# CU-06 - Crear reserva

## Actor principal

Comprador.

## Objetivo

Reservar una cantidad determinada de entradas.

## Precondiciones

- El comprador está autenticado.
- El evento y la localidad existen.
- La cantidad solicitada es válida.

## Flujo principal

1. El comprador elige localidad y cantidad.
2. La UI valida la cantidad contra la disponibilidad mostrada.
3. El comprador confirma.
4. La UI deshabilita el botón y muestra el estado en curso.
5. El sistema procesa la reserva y descuenta la disponibilidad.
6. La UI muestra la confirmación y actualiza la disponibilidad.
7. El comprador puede ir a "Mis reservas".

## Flujos alternativos

### FA-01 - Disponibilidad insuficiente

1. El sistema rechaza la reserva (`409`).
2. La UI informa que no hay suficientes entradas.
3. La UI refresca la disponibilidad y ajusta la cantidad máxima.

### FA-02 - Solicitudes concurrentes

1. Otro usuario toma las entradas antes de la confirmación.
2. El sistema acepta solo las solicitudes con disponibilidad.
3. La UI del rechazado muestra el resultado y refresca el estado.

### FA-03 - Error del servicio

1. La operación no se completa o el servicio no responde.
2. La UI muestra un estado de error con reintento.
3. Nunca se muestra la reserva como confirmada.

### FA-04 - Sesión expirada

1. El sistema responde `401`.
2. La UI redirige a login conservando la selección cuando sea posible.

## Postcondición

Si la reserva es exitosa:

- Existe un registro de reserva confirmado por el sistema.
- La disponibilidad disminuye.
- La UI refleja el nuevo estado.

Si no es exitosa, no se muestra ninguna reserva como confirmada.

---

# CU-07 - Cancelar reserva

## Actor principal

Comprador.

## Objetivo

Cancelar una reserva y liberar sus entradas.

## Precondiciones

- La reserva existe y pertenece al comprador.
- La reserva está en un estado que permite cancelación.

## Flujo principal

1. El comprador abre el detalle de la reserva y elige cancelar.
2. La UI pide confirmación.
3. El comprador confirma.
4. El sistema cambia el estado y libera las entradas.
5. La UI actualiza el estado de la reserva.

## Flujos alternativos

### FA-01 - Reserva no cancelable

1. La UI oculta o deshabilita la acción.
2. Si el sistema la rechaza, se informa el motivo.

### FA-02 - Error del servicio

1. La UI muestra un error y permite reintentar.
2. El estado de la reserva no se cambia localmente sin confirmación.

## Postcondición

La reserva queda cancelada y la disponibilidad se libera.
