# P-002 — Reestructuración de `docs_ia` para el frontend

- **Identificador:** P-002
- **Fecha:** 2026-10-20
- **Objetivo:** ajustar `docs_ia` del repo `ticketflow-frontend` para eliminar el contenido que
  pertenece al backend y reorganizarlo en documentos propios del frontend (funcionalidades, diseño,
  requisitos, calidad y pruebas de interfaz).
- **Prompt completo utilizado:**

  > necesito que en el repo de forntend, ajustes la carpeta de docs_ia, ya que hay cosas que son
  > para backend, entonces quiero que quites todas esas cosas que son para backend y haz archivos
  > como por ejemplo de funcionalidades, de diseño, etc

- **Archivos de contexto consultados:**
  - `ticketflow-frontend/AGENTS.md`
  - `ticketflow-frontend/.clinerules`
  - `docs_ia/README.md`
  - `docs_ia/contexto/contexto_negocio.md`
  - `docs_ia/contexto/arquitectura/arquitectura.md` (para decidir su eliminación)
  - `docs_ia/contexto/arquitectura/desiciones_arquitectonicas.md` (para decidir su eliminación)
  - `docs_ia/contexto/requisitos/epicas_feactures.md`
  - `docs_ia/contexto/requisitos/historias_usuarios.md`
  - `docs_ia/contexto/requisitos/casos_uso.md`
  - `docs_ia/contexto/calidad/atributos_calidad.md`
  - `docs_ia/contexto/calidad/escenarios_calidad.md`
  - `docs_ia/contexto/pruebas/estrategia_pruebas.md`
  - `docs_ia/contexto/pruebas/pruebas_cargas.md`
  - `docs_ia/decisiones/README.md`
  - `docs_ia/prompts/README.md`
  - `docs_ia/prompts/P-001-creacion-estructura-docs-ia.md`

- **Archivos eliminados:**
  - `docs_ia/contexto/arquitectura/arquitectura.md`
  - `docs_ia/contexto/arquitectura/desiciones_arquitectonicas.md`
  - `docs_ia/contexto/pruebas/pruebas_cargas.md`
  - `docs_ia/contexto/requisitos/epicas_feactures.md`
  - (carpeta `docs_ia/contexto/arquitectura/`, que quedó vacía)

- **Archivos creados:**
  - `docs_ia/contexto/funcionalidades.md`
  - `docs_ia/contexto/diseno.md`

- **Archivos reescritos:**
  - `docs_ia/README.md`
  - `docs_ia/contexto/contexto_negocio.md`
  - `docs_ia/contexto/calidad/atributos_calidad.md`
  - `docs_ia/contexto/calidad/escenarios_calidad.md`
  - `docs_ia/contexto/pruebas/estrategia_pruebas.md`
  - `docs_ia/contexto/requisitos/historias_usuarios.md`
  - `docs_ia/contexto/requisitos/casos_uso.md`
  - `ticketflow-frontend/AGENTS.md` (sección de documentación)

- **Resumen de la respuesta generada:**
  - Se identificó como contenido de backend la arquitectura de microservicios, los ADRs de
    plataforma, las pruebas de carga y la estrategia de pruebas basada en Testcontainers, además
    de las secciones de arquitectura, tecnologías, metodología y observabilidad del contexto de
    negocio.
  - Se eliminó ese contenido del repo de frontend y se conservó lo que aplica a la interfaz:
    negocio, actores, reglas (RB-xx), requisitos y casos de uso con impacto en la UI.
  - Se creó `funcionalidades.md` (módulos F1–F6, roles, flujos, prioridad y trazabilidad HU/CU).
  - Se creó `diseno.md` (principios UI/UX, navegación, inventario de pantallas, componentes,
    patrones, formularios, estados, accesibilidad y responsive).
  - Se reescribieron los documentos de calidad y pruebas para el frontend.
  - Se excluyeron HU-18 a HU-20 y CU-08 a CU-10 (rendimiento y pruebas de carga).

- **Propuestas realizadas por la IA:** ninguna decisión de stack, sistema de diseño ni
  herramientas. Se listaron como decisiones pendientes en `docs_ia/README.md` y en
  `contexto/diseno.md`.

- **Decisiones pendientes:**
  - Stack y framework del frontend.
  - Sistema de diseño e identidad visual.
  - Librería de componentes.
  - Gestión de estado y fetching de datos.
  - Almacenamiento del token en el cliente.
  - Nivel de accesibilidad objetivo.
  - Herramientas de pruebas.
  - Contrato de consumo del API Gateway.

- **Estado:** `IMPLEMENTADO`

## Qué NO se hizo (a propósito)

- No se eligió ni asumió stack, framework, librería de componentes ni sistema de diseño.
- No se modificó ningún documento de los repositorios de backend.
- No se tocó `.clinerules` (sigue vigente como gobernanza para Cline).
- No se creó una decisión `DA-xxx`: las decisiones pendientes se listan, no se aprueban.
- No se eliminó `P-001` ni ningún registro histórico de trazabilidad.
