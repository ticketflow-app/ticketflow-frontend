# Estrategia de Pruebas del Frontend

## 1. Propósito

Este documento define cómo se verifica el frontend de TicketFlow. Sustituye a la estrategia de
plataforma, centrada en pruebas unitarias de backend, Testcontainers, integración con PostgreSQL,
Redis y Kafka, y pruebas de concurrencia y carga.

El frontend **no** prueba la concurrencia ni la consistencia del inventario: esas pruebas
pertenecen a los servicios de backend. Aquí se prueba que la interfaz represente correctamente el
estado que recibe y que los flujos de usuario funcionen.

> **Stack de pruebas (DA-001, APROBADA):** Vitest + React Testing Library + MSW para unitarias/componentes/integración de UI. Playwright para pruebas E2E. Las herramientas ya están instaladas y configuradas.

---

## 2. Principios

1. Probar el comportamiento visible para el usuario, no detalles de implementación.
2. Priorizar los flujos críticos: autenticación, consulta de disponibilidad, reserva y
   cancelación.
3. Probar los estados de error y borde: `401`, `403`, `404`, `409`, `503`, timeout y red caída.
4. No simular éxito cuando el backend falla.
5. Mantener las pruebas rápidas y deterministas; los servicios externos se simulan.
6. No introducir herramientas sin analizar necesidad, compatibilidad y aprobación humana.

---

## 3. Niveles de prueba

### 3.1 Unitarias

- Funciones puras: validaciones de formularios, formateo de fechas y precios, cálculos de cantidad.
- Hooks o utilidades de estado, sin renderizar la interfaz.
- No requieren backend ni navegador.

### 3.2 Pruebas de componentes

- Renderizado de componentes con distintos estados: cargando, vacío, error, éxito.
- Interacción: escribir, seleccionar, enviar, deshabilitar botones.
- Accesibilidad básica: etiquetas, roles, foco y anuncios.
- Servicios simulados (mocks) para las respuestas del backend.

### 3.3 Pruebas de integración de UI

- Flujos que combinan varias pantallas o componentes con datos simulados.
- Navegación protegida por sesión y por rol.
- Manejo de `401`, `403`, `404`, `409` y `503`.

### 3.4 Pruebas end-to-end (E2E)

- **No están en este repositorio.** Las pruebas E2E se gestionarán en un repositorio independiente para poder orquestar todo el stack (gateway + servicios backend + frontend).
- Cuando se ejecuten desde el repo externo, cubrirán: flujo completo de compra, flujo de organización y flujo de administración.
- Deben ser pocas y estables; cubren los caminos críticos.

### 3.5 Accesibilidad

- Navegación completa por teclado.
- Foco visible y atrapado en diálogos.
- Contraste y etiquetas.
- Anuncios de resultados asíncronos.
- Automatización cuando la herramienta lo permita; complementar con revisión manual.

### 3.6 Pruebas visuales (opcional)

- Regresión visual de pantallas clave si el stack lo permite.
- No es obligatoria para el MVP.

---

## 4. Qué probar por funcionalidad

| Funcionalidad | Pruebas mínimas |
|---|---|
| Registro | Validación de campos, correo existente, éxito y redirección |
| Inicio de sesión | Credenciales válidas e inválidas, redirección, sesión expirada |
| Perfil | Renderizado por rol, ruta protegida |
| Catálogo | Carga, vacío, error, búsqueda, filtros, paginación |
| Detalle de evento | Datos, disponibilidad, agotado, `404` |
| Reserva | Cantidad válida, doble clic, éxito, `409`, `401`, `503` |
| Mis reservas | Lista, vacío, detalle, estados |
| Cancelación | Confirmación, éxito, no cancelable, error |
| Gestión de eventos | Validaciones, localidades, capacidad, permisos |
| Administración | Listado, cambio de rol, `403` |

---

## 5. Casos críticos

1. **No sobreventa desde la UI:** si el backend rechaza por falta de disponibilidad (`409`), la UI
   no muestra la reserva como confirmada y refresca el estado.
2. **Doble envío:** dos clics en "Reservar" producen una sola solicitud.
3. **Sesión expirada:** una acción protegida con `401` redirige a login y conserva la intención.
4. **Servicio caído:** un `503` o timeout muestra error con reintento, nunca un falso éxito.
5. **Permisos:** un comprador no ve ni ejecuta acciones de organizador o administrador.
6. **Accesibilidad:** el flujo de compra se completa solo con teclado.
7. **Responsive:** el flujo de compra funciona a 360 px.

---

## 6. Datos y simulación de servicios

- Los datos de prueba deben ser explícitos y reproducibles.
- Las respuestas del backend se simulan (mocks o interceptores) para cubrir éxito y errores.
- Los escenarios de concurrencia se representan como respuestas `409`, no como concurrencia real
  en el navegador.
- No se usan datos reales de usuarios ni credenciales de producción.

---

## 7. Herramientas

| Nivel | Herramienta | Uso |
|---|---|---|
| Unitarias/Componentes/Integración UI | [Vitest](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) + [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) + [jsdom](https://github.com/jsdom/jsdom) | Pruebas rápidas con DOM simulado. Configuración en `vitest.config.ts`. |
| Mocking de red | [MSW](https://mswjs.io/) v3 | Interceptación de peticiones HTTP. Handlers en `src/mocks/` (server para Vitest, browser para dev). |
| E2E | [Playwright](https://playwright.dev/) | **Fuera de este repositorio.** Se ejecutarán desde un proyecto de pruebas E2E independiente. |
| Accesibilidad | Revisión manual + validación semántica | Automatización futura si se justifica con una `DA-xxx`. |

---

## 8. Integración continua (pendiente)

- Ejecutar pruebas unitarias y de componentes en cada cambio.
- Ejecutar E2E en los flujos críticos antes de integrar.
- Publicar resultados y cobertura cuando exista pipeline.
- La plataforma de CI/CD no está definida.

---

## 9. Fuera de alcance

- Pruebas de carga y estrés del sistema.
- Pruebas de concurrencia del inventario.
- Pruebas de integración con PostgreSQL, Redis o Kafka.
- Pruebas de rendimiento de microservicios.

Estas pruebas pertenecen a los repositorios de backend y se documentan allí.
