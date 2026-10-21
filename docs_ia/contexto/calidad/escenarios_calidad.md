# Escenarios de Calidad del Frontend

## 1. Propósito

Este documento describe escenarios concretos que permiten evaluar los atributos de calidad de la
interfaz (`atributos_calidad.md`). Sustituye a la versión de plataforma, centrada en concurrencia,
carga y disponibilidad del backend.

Formato: **estímulo → respuesta esperada → medida**.

---

## EC-01 — Pico de tráfico durante la venta

- **Atributo:** rendimiento percibido / disponibilidad.
- **Estímulo:** muchos usuarios consultan el catálogo y el detalle al mismo tiempo.
- **Respuesta esperada:** la interfaz sigue navegable, muestra skeletons mientras carga y no
  bloquea acciones ya disponibles; los errores se muestran sin romper la pantalla.
- **Medida:** el flujo de consulta no se congela; el usuario puede seguir navegando o reintentar.

---

## EC-02 — La disponibilidad cambia mientras el usuario decide

- **Atributo:** consistencia.
- **Estímulo:** otro usuario compra las últimas entradas entre la consulta y la confirmación.
- **Respuesta esperada:** al confirmar, el backend rechaza (`409`); la UI informa y refresca la
  disponibilidad; no muestra la reserva como exitosa.
- **Medida:** cero reservas mostradas como confirmadas sin confirmación del backend.

---

## EC-03 — Intento de reserva sin disponibilidad

- **Atributo:** usabilidad / consistencia.
- **Estímulo:** el usuario elige una cantidad mayor a la disponible o la localidad se agota.
- **Respuesta esperada:** la UI impide cantidades inválidas y, si el backend rechaza, muestra un
  mensaje claro con la acción siguiente (ajustar cantidad o elegir otra localidad).
- **Medida:** el usuario entiende el motivo y puede continuar sin recargar la página.

---

## EC-04 — Servicio no disponible o timeout

- **Atributo:** robustez.
- **Estímulo:** el backend responde `503` o no responde dentro del tiempo esperado.
- **Respuesta esperada:** estado de error con opción de reintentar; no se pierde lo ingresado; no
  se simula éxito.
- **Medida:** la aplicación sigue usable y el reintento funciona cuando el servicio vuelve.

---

## EC-05 — Sesión expirada durante una acción

- **Atributo:** seguridad / usabilidad.
- **Estímulo:** el usuario intenta reservar o gestionar con un token expirado (`401`).
- **Respuesta esperada:** se informa que la sesión expiró y se redirige a login conservando la
  intención (evento, localidad y cantidad cuando sea posible).
- **Medida:** tras autenticarse, el usuario retoma el flujo sin empezar de cero.

---

## EC-06 — Usuario sin permisos

- **Atributo:** seguridad.
- **Estímulo:** un comprador intenta acceder a una ruta de organizador o administrador.
- **Respuesta esperada:** la UI oculta o deshabilita la acción y, si el backend responde `403`,
  muestra acceso denegado sin filtrar información.
- **Medida:** ninguna acción administrativa visible para roles no autorizados.

---

## EC-07 — Doble envío de una reserva

- **Atributo:** consistencia.
- **Estímulo:** el usuario hace doble clic en "Reservar".
- **Respuesta esperada:** el botón se deshabilita tras el primer envío y se muestra estado en
  curso; se envía una sola solicitud.
- **Medida:** una sola reserva creada por intención de compra.

---

## EC-08 — Uso solo con teclado

- **Atributo:** accesibilidad.
- **Estímulo:** el usuario navega y completa una reserva sin mouse.
- **Respuesta esperada:** todos los controles son alcanzables, el foco es visible, los diálogos
  atrapan y devuelven el foco, y los mensajes se anuncian.
- **Medida:** flujo completo sin trampas de foco ni controles inaccesibles.

---

## EC-09 — Uso en pantalla pequeña

- **Atributo:** responsividad.
- **Estímulo:** el usuario completa el flujo de compra a 360 px de ancho.
- **Respuesta esperada:** el contenido se adapta, sin scroll horizontal, con controles táctiles
  adecuados.
- **Medida:** flujo completo usable en móvil.

---

## EC-10 — Listados vacíos

- **Atributo:** usabilidad.
- **Estímulo:** no hay eventos, reservas o resultados de búsqueda.
- **Respuesta esperada:** empty state con explicación y acción sugerida (limpiar filtros, crear el
  primer evento, volver al catálogo).
- **Medida:** el usuario entiende que no hay datos y sabe qué hacer.

---

## EC-11 — Recurso inexistente

- **Atributo:** robustez / usabilidad.
- **Estímulo:** el usuario abre un evento o reserva que no existe (`404`).
- **Respuesta esperada:** pantalla "no encontrado" con enlace al inicio o al listado.
- **Medida:** sin pantallas en blanco ni errores técnicos expuestos.

---

## EC-12 — Error de red intermitente

- **Atributo:** robustez.
- **Estímulo:** la conexión falla durante una consulta o un guardado.
- **Respuesta esperada:** mensaje de error, reintento disponible y datos ingresados conservados.
- **Medida:** al restablecerse la conexión, el usuario puede continuar sin rehacer el trabajo.

---

## EC-13 — Cambio de capacidad con reservas existentes

- **Atributo:** consistencia / usabilidad.
- **Estímulo:** el organizador reduce la capacidad de una localidad que ya tiene reservas.
- **Respuesta esperada:** la UI advierte el impacto antes de guardar y refleja el resultado que
  devuelva el backend; no calcula disponibilidad por su cuenta.
- **Medida:** el organizador entiende la consecuencia y no se muestra un estado inconsistente.

---

## EC-14 — Actualización de disponibilidad tras reservar o cancelar

- **Atributo:** consistencia.
- **Estímulo:** una reserva se crea o se cancela correctamente.
- **Respuesta esperada:** la disponibilidad visible se actualiza en la misma sesión.
- **Medida:** el usuario ve el nuevo estado sin recargar manualmente.
