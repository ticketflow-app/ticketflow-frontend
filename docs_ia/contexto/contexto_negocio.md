# Contexto de Negocio (Frontend)

## 1. Información general del proyecto

### Nombre del proyecto

Metodología de Ingeniería de Software con Inteligencia Artificial para Aplicaciones de Gran Escala.

### Tipo de proyecto

Proyecto académico de desarrollo de software y evaluación de una metodología de ingeniería de
software asistida por Inteligencia Artificial.

### Equipo

Tres estudiantes.

### Duración

Semestre académico 2026-2. El prototipo funcional tiene una restricción aproximada de seis semanas
para su implementación principal.

### Alcance de este documento

Este documento describe el **contexto de negocio desde la perspectiva del frontend**: qué necesita
el usuario, qué debe mostrar la interfaz y qué reglas de negocio debe respetar. No describe la
arquitectura interna del backend ni decisiones de infraestructura; esas viven en los repositorios
de los servicios correspondientes.

---

## 2. Contexto del problema

Las aplicaciones que manejan eventos de alta demanda experimentan incrementos repentinos y
significativos de usuarios cuando se habilita la venta o reserva de entradas para eventos
populares.

En ese momento, una gran cantidad de usuarios intenta simultáneamente:

- Consultar los eventos disponibles.
- Consultar el detalle de un evento.
- Consultar localidades y entradas restantes.
- Seleccionar una localidad y una cantidad de entradas.
- Crear una reserva.

Ese comportamiento concentra solicitudes en periodos muy cortos. Para el frontend, el reto es
mantener una experiencia **clara, rápida y honesta** bajo esa carga: no bloquearse, no mostrar
datos obsoletos como definitivos y no prometer reservas que el sistema no confirmó.

---

## 3. Problema principal

Diseñar y construir la interfaz de un prototipo de reserva de entradas que permita:

- Descubrir eventos y consultar su disponibilidad.
- Completar una reserva con pocos pasos y sin ambigüedad.
- Entender de inmediato cuándo no hay disponibilidad o cuándo el servicio falla.
- Gestionar eventos (organizador) y usuarios (administrador) según el rol.

El frontend **no** resuelve la concurrencia ni la consistencia del inventario: esas son
responsabilidades del backend. Su papel es representar correctamente el estado que el backend
expone y evitar acciones que induzcan sobreventa o reservas duplicadas desde la interfaz.

---

## 4. Objetivo general

Proporcionar una interfaz web que permita a compradores, organizadores y administradores operar el
sistema de reserva de entradas de forma clara, accesible y resiliente, incluso durante picos de
demanda.

---

## 5. Actores y roles

### 5.1 Comprador

Usuario que consulta eventos y realiza reservas. Puede:

- Registrarse e iniciar sesión.
- Consultar eventos, buscarlos y filtrarlos.
- Ver el detalle del evento y la disponibilidad.
- Seleccionar localidad y cantidad de entradas.
- Crear una reserva.
- Consultar sus reservas, ver su detalle y cancelarlas.

### 5.2 Organizador

Usuario responsable de administrar eventos. Puede:

- Crear y modificar eventos.
- Definir localidades, precios y capacidades.
- Consultar sus eventos.

### 5.3 Administrador

Rol para operaciones administrativas. Puede gestionar usuarios y roles.

### 5.4 Visitante

Usuario no autenticado. Puede consultar el catálogo, el detalle y la disponibilidad, y registrarse
o iniciar sesión. No puede reservar ni acceder a secciones privadas.

> El sistema de pruebas de carga y el staff de check-in **no** son actores de la interfaz en el
> alcance actual. Cualquier rol adicional requiere definición previa en `contexto` y una decisión.

---

## 6. Alcance funcional

El frontend cubre los siguientes módulos (detalle en `funcionalidades.md`):

1. **Autenticación y cuenta:** registro, inicio y cierre de sesión, perfil.
2. **Catálogo de eventos:** listado, búsqueda, filtros y detalle.
3. **Disponibilidad:** consulta por localidad y refresco antes de reservar.
4. **Reservas:** creación, historial, detalle y cancelación.
5. **Gestión de eventos:** alta y edición de eventos, localidades, precios y capacidades.
6. **Administración:** gestión de usuarios y roles.

---

## 7. Flujo general del negocio

1. Un organizador crea un evento y configura sus localidades, precios y capacidades.
2. Los compradores consultan los eventos disponibles y seleccionan uno.
3. En el detalle, el comprador conoce las características y la disponibilidad por localidad.
4. El comprador elige localidad y cantidad, y confirma la reserva.
5. La interfaz muestra el resultado: confirmación o rechazo por falta de disponibilidad.
6. El comprador puede consultar y cancelar sus reservas.

La interfaz debe reflejar el estado real del inventario en cada paso y refrescarlo antes de
confirmar una reserva.

---

## 8. Regla fundamental del negocio

El sistema nunca debe permitir una cantidad de reservas confirmadas superior a la capacidad
disponible de una localidad (**RB-11, no sobreventa**).

Implicaciones para el frontend:

- No habilitar cantidades superiores a la disponibilidad mostrada.
- Refrescar la disponibilidad antes de confirmar.
- Tratar el rechazo por falta de disponibilidad (`409`) como un resultado de negocio esperado,
  no como un error técnico.
- Nunca mostrar una reserva como confirmada sin respuesta exitosa del backend.

---

## 9. Separación entre catálogo e inventario

- **Catálogo:** información estática del evento (nombre, descripción, fecha, lugar, categoría,
  localidades, precios, capacidad total).
- **Inventario:** disponibilidad dinámica y reservas.

Para la interfaz esto significa que el detalle del evento combina dos fuentes: los datos estáticos
del evento y la disponibilidad actual. La UI no debe presentar la capacidad total como si fuera
disponibilidad.

---

## 10. Reglas de negocio relevantes para la UI

| Regla | Implicación en la interfaz |
|---|---|
| RB-01 Identificación de usuarios | Cada usuario se identifica por su cuenta autenticada. |
| RB-02 Correo único | El registro informa si el correo ya existe. |
| RB-03 Contraseñas | La UI nunca muestra ni registra la contraseña en texto plano; usa campos de tipo password. |
| RB-04 Autenticación | Las rutas y acciones protegidas exigen sesión; `401` redirige a login. |
| RB-05 Roles | La UI oculta o deshabilita acciones según el rol; un `403` muestra acceso denegado. |
| RB-06 Organización de eventos | Solo el organizador autorizado ve las acciones de gestión. |
| RB-07 Capacidad | El formulario de localidad exige una capacidad mayor que cero. |
| RB-08 Disponibilidad no negativa | La UI no permite cantidades que dejen la disponibilidad en negativo. |
| RB-09 Reserva | Solo se puede confirmar si hay disponibilidad suficiente. |
| RB-10 Concurrencia | La UI evita dobles envíos y refresca el estado tras un conflicto. |
| RB-11 No sobreventa | El rechazo por falta de disponibilidad se comunica con claridad. |
| RB-12 Inventario como fuente de verdad | La disponibilidad mostrada proviene del backend; la UI no la calcula. |
| RB-13 Persistencia | La UI no persiste reservas; refleja el estado confirmado por el backend. |
| RB-14 Disponibilidad rápida | La consulta de disponibilidad no debe bloquear la navegación. |
| RB-15 Independencia de servicios | La UI consume un único punto de entrada (API Gateway). |

---

## 11. Escenario crítico

Se abre la venta de un evento altamente demandado y cientos o miles de usuarios intentan reservar
al mismo tiempo en un periodo corto.

Desde la interfaz se espera:

- Que el catálogo y el detalle sigan respondiendo.
- Que la disponibilidad se muestre actualizada o se indique que se está actualizando.
- Que solo las reservas confirmadas por el backend se muestren como exitosas.
- Que los rechazos por falta de disponibilidad sean claros y accionables.
- Que los errores de servicio se comuniquen sin bloquear la aplicación.

---

## 12. Restricciones del proyecto

1. Equipo de tres personas.
2. Prototipo con aproximadamente seis semanas para su implementación principal.
3. Proyecto académico, no una plataforma comercial.
4. El sistema debe ser suficientemente pequeño para implementarse y evaluarse en el tiempo
   disponible.
5. No se implementan integraciones financieras reales.
6. Las pruebas de alta demanda se realizan con escenarios controlados (responsabilidad del
   backend).
7. La Inteligencia Artificial se usa como apoyo al proceso de ingeniería, no como excusa para
   inventar requisitos.

---

## 13. Fuera de alcance

- Pagos reales, integración con bancos, facturación y procesamiento de tarjetas.
- Aplicación móvil nativa.
- Emisión real de entradas y códigos QR.
- Notificaciones por correo o SMS.
- Integración con plataformas externas de eventos.
- Recomendaciones personalizadas.
- Pruebas de carga y análisis de rendimiento del backend.
- Arquitectura de microservicios, inventario, caché, mensajería y observabilidad (pertenecen a los
  repositorios de backend).

---

## 14. Principios para la IA

1. Respetar el alcance definido.
2. No inventar funcionalidades ni roles.
3. No asumir el stack ni el sistema de diseño: proponer `DA-xxx` y esperar aprobación.
4. Priorizar soluciones simples y apropiadas para un prototipo académico.
5. Mantener la regla de no sobreventa visible en la interfaz.
6. Diferenciar siempre entre información definida, suposición, propuesta y decisión aprobada.
7. Explicar las decisiones de UI relacionándolas con los requisitos y atributos de calidad.

---

## 15. Fuente de verdad

En caso de conflicto entre propuestas de la IA y los documentos del proyecto, prevalecen los
requisitos y decisiones explícitamente establecidos en `docs_ia`. La IA puede proponer mejoras,
pero debe identificarlas como propuestas y no asumir que forman parte del sistema.

---

## 16. Estado actual

El repositorio contiene únicamente documentación: no hay código ni stack definido. El siguiente
paso es aprobar las decisiones pendientes (stack, sistema de diseño, estrategia de pruebas y
contrato de consumo) antes de implementar.
