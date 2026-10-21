# Atributos de Calidad del Frontend

## 1. Propósito

Este documento define los atributos de calidad que aplican al frontend de TicketFlow y cómo se
verifican. Sustituye a la versión de plataforma, que estaba centrada en atributos de backend
(throughput, CPU, concurrencia de inventario, observabilidad).

Los atributos de backend (escalabilidad del sistema, consistencia del inventario, latencia del
servicio) se documentan y evalúan en los repositorios de los servicios correspondientes. Aquí solo
se consideran los que el frontend puede influir o debe reflejar.

---

## 2. Usabilidad

**Definición:** el usuario completa sus tareas (encontrar un evento, reservar, cancelar, gestionar)
con el mínimo esfuerzo y sin ambigüedad.

**Importancia:** es el atributo principal de la interfaz; un flujo confuso genera reservas
duplicadas o abandono.

**Indicadores:**

- Pasos para completar una reserva.
- Tasa de errores de formulario.
- Abandono en el flujo de compra.
- Claridad de los mensajes (comprensión sin soporte).

**Verificación:** pruebas de usabilidad con tareas guiadas y revisión de flujos.

---

## 3. Accesibilidad

**Definición:** la interfaz puede ser usada por personas con distintas capacidades, incluyendo
navegación por teclado y lectores de pantalla.

**Importancia:** requisito de calidad y de inclusión; además mejora la semántica y la
mantenibilidad.

**Indicadores:**

- Campos con etiqueta asociada.
- Navegación completa por teclado.
- Foco visible y orden lógico.
- Contraste suficiente.
- Mensajes anunciados (`aria-live`).

**Verificación:** revisión manual con teclado y lector de pantalla; pruebas automatizadas de
accesibilidad cuando el stack lo permita.

El nivel de conformidad objetivo (por ejemplo, WCAG 2.1 AA) es una decisión pendiente.

---

## 4. Responsividad

**Definición:** la interfaz se adapta a distintos tamaños de pantalla sin perder funcionalidad.

**Importancia:** el flujo de compra debe funcionar en móvil, donde ocurre gran parte del tráfico.

**Indicadores:**

- Flujo completo usable a 360 px de ancho.
- Sin scroll horizontal.
- Controles táctiles con tamaño adecuado.

**Verificación:** pruebas en viewports representativos y revisión visual.

---

## 5. Rendimiento percibido

**Definición:** la interfaz responde rápido desde la perspectiva del usuario, incluso cuando el
backend tarda.

**Importancia:** en picos de demanda la latencia real aumenta; la percepción debe seguir siendo de
fluidez.

**Indicadores:**

- Tiempo hasta el primer contenido útil.
- Uso de skeletons en cargas.
- Búsqueda con debounce.
- Sin bloqueos de la UI durante peticiones.

**Verificación:** medición de métricas de carga en el navegador y pruebas con latencia simulada.

---

## 6. Disponibilidad y robustez de la interfaz

**Definición:** la aplicación sigue siendo usable y comprensible cuando un servicio falla o
responde lento.

**Importancia:** el backend puede devolver `503`, timeouts o errores; la UI no debe romperse ni
mostrar datos falsos.

**Indicadores:**

- Estados de error con reintento.
- Manejo de `401`, `403`, `404`, `409`, `503`.
- Recuperación sin recargar toda la aplicación.
- Ningún éxito simulado ante fallo.

**Verificación:** pruebas con respuestas simuladas de error y timeout.

---

## 7. Consistencia

**Definición:** la interfaz muestra un estado coherente entre pantallas y tras cada operación.

**Importancia:** una disponibilidad desactualizada o un estado duplicado induce sobreventa o
reservas duplicadas.

**Indicadores:**

- Refresco de disponibilidad tras reservar o cancelar.
- Una sola representación del estado de una reserva.
- Fuente única de verdad para el estado de sesión.

**Verificación:** pruebas de flujo completo y de conflictos (`409`).

---

## 8. Seguridad (lado cliente)

**Definición:** la interfaz protege la sesión y no expone información sensible ni permite acciones
no autorizadas.

**Importancia:** el frontend es la superficie de entrada del usuario.

**Indicadores:**

- Token adjunto solo a peticiones protegidas.
- Cierre de sesión limpia el estado.
- Acciones ocultas/deshabilitadas según rol.
- Sin secretos ni datos sensibles en el código o en logs.
- Contraseñas en campos de tipo password.

**Verificación:** revisión de flujos de autenticación y de permisos; pruebas de `401`/`403`.

La estrategia de almacenamiento del token es una decisión pendiente.

---

## 9. Mantenibilidad

**Definición:** la interfaz es fácil de entender, modificar y probar.

**Importancia:** el prototipo evoluciona rápido y con un equipo pequeño.

**Indicadores:**

- Componentes con responsabilidad única.
- Nomenclatura consistente en inglés.
- Pruebas de componentes y flujos críticos.
- Separación entre presentación, estado y acceso a datos.

**Verificación:** revisión de código y cobertura de pruebas cuando exista implementación.

---

## 10. Escalabilidad de la interfaz

**Definición:** la interfaz soporta más usuarios y más datos sin degradarse de forma perceptible.

**Importancia:** el catálogo y las reservas crecen durante el prototipo.

**Indicadores:**

- Paginación en listados.
- Carga bajo demanda.
- Evitar renderizar listas completas innecesariamente.

**Verificación:** pruebas con volúmenes de datos representativos.

> La escalabilidad del sistema (throughput, concurrencia, inventario) **no** se evalúa desde este
> repositorio.
