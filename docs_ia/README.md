# docs_ia — ticketflow-frontend

Esta carpeta es la **única fuente autorizada de contexto** para trabajar en el frontend de
TicketFlow (ver `.clinerules` y `AGENTS.md` en la raíz del repo). No asumas información que no esté
aquí; si falta algo, indícalo explícitamente y propón una decisión en `decisiones/`.

## 1. Qué es este repo

Frontend web de TicketFlow: la interfaz de usuario de la plataforma de venta y reserva de boletos
para eventos de alta demanda. El repo **aún no tiene código ni stack definido**; por ahora contiene
solo documentación.

## 2. Estructura

```
docs_ia/
├── contexto/                        # fuente autorizada (solo frontend)
│   ├── contexto_negocio.md          # problema, actores, reglas de negocio y alcance
│   ├── funcionalidades.md           # módulos, pantallas, flujos y prioridad
│   ├── diseno.md                    # principios UI/UX, navegación, pantallas, componentes, estados
│   ├── contrato_api.md              # endpoints reales, auth, errores y huecos del backend
│   ├── requisitos/
│   │   ├── historias_usuarios.md    # HU-01..HU-17 con implicación en la UI
│   │   └── casos_uso.md             # CU-01..CU-07 como flujos de usuario
│   ├── calidad/
│   │   ├── atributos_calidad.md     # usabilidad, accesibilidad, robustez, etc.
│   │   └── escenarios_calidad.md    # escenarios verificables de la interfaz
│   └── pruebas/
│       └── estrategia_pruebas.md    # niveles y casos de prueba del frontend
├── decisiones/                      # decisiones arquitectónicas y técnicas (DA-xxx)
├── prompts/                         # trazabilidad de uso de IA (P-xxx)
└── README.md
```

## 3. Qué se eliminó y por qué

La versión anterior copiaba **especificaciones de plataforma** desde `ticketflow-user-service`,
incluyendo documentos de backend que no aplican a este repo. Se eliminaron:

| Archivo eliminado | Motivo |
|---|---|
| `contexto/arquitectura/arquitectura.md` | Arquitectura de microservicios, gateway, AWS, Kafka, Redis y hexagonal: backend. |
| `contexto/arquitectura/desiciones_arquitectonicas.md` | ADRs de plataforma (microservicios, Redis, PostgreSQL, JWT): backend. |
| `contexto/pruebas/pruebas_cargas.md` | Pruebas de carga del sistema: backend. |
| `contexto/requisitos/epicas_feactures.md` | Mezclaba funcionalidades de UI con capacidades internas de backend; se reemplazó por `funcionalidades.md`. |

También se reescribieron para eliminar el sesgo de backend:

- `contexto/contexto_negocio.md`: se quitaron arquitectura, tecnologías, ADD/SDD/AIOps y
  observabilidad; se conservó el negocio, los actores, las reglas y el alcance de la UI.
- `contexto/calidad/atributos_calidad.md`: se reemplazaron throughput, CPU y consistencia de
  inventario por atributos de interfaz.
- `contexto/calidad/escenarios_calidad.md`: se reemplazaron escenarios de concurrencia y carga por
  escenarios de UI.
- `contexto/pruebas/estrategia_pruebas.md`: se reemplazaron Testcontainers, PostgreSQL, Redis,
  Kafka y pruebas de concurrencia por pruebas de frontend.
- `contexto/requisitos/historias_usuarios.md`: se excluyeron HU-18 a HU-20 (rendimiento).
- `contexto/requisitos/casos_uso.md`: se excluyeron CU-08 a CU-10 (carga, anomalías, análisis).

> Las specs de backend siguen existiendo en los repositorios de los servicios. Este repo no las
> duplica.

## 4. Documentos nuevos

- **`contexto/funcionalidades.md`**: alcance funcional del frontend (F1–F6), roles, flujos,
  prioridad MVP y trazabilidad con HU/CU.
- **`contexto/diseno.md`**: principios de UI/UX, arquitectura de información, inventario de
  pantallas, componentes, patrones de interacción, formularios, estados, accesibilidad y
  responsive.

## 5. Decisiones pendientes

Ninguna de estas decisiones se toma en la documentación; deben proponerse como `DA-xxx` y esperar
aprobación humana:

| Tema | Estado |
|---|---|
| Stack y framework del frontend | `DA-001` (PROPUESTA: Next.js + TypeScript) |
| Sistema de diseño / identidad visual | Base neutral shadcn/ui acordada; tokens pendientes |
| Librería de componentes | `DA-001` (PROPUESTA: shadcn/ui) |
| Gestión de estado y fetching de datos | `DA-001` (PROPUESTA: TanStack Query + Zustand) |
| Almacenamiento del token en el cliente | Cookie `httpOnly` + BFF (acordado 2026-10-20) |
| Nivel de accesibilidad objetivo | WCAG 2.1 AA (acordado 2026-10-20) |
| Herramientas de pruebas | `DA-001` (PROPUESTA: Vitest + RTL + Playwright) |
| Contrato de consumo del API Gateway | `contexto/contrato_api.md` (rama `main`); faltan endpoints de backend |
| Rama de inventario del contrato | `main` (2026-10-20) |
| Catálogo | Mocks con MSW hasta que backend lo implemente |
| Disponibilidad pública | Cambio acordado en el gateway |
| Despliegue | Local + Docker Compose |
| Idioma de UI | Español |

## 6. Cómo trabajar con estos documentos

1. Antes de una tarea, lee el documento de `contexto/` relacionado.
2. Si la tarea requiere una decisión no definida, detente y propón una `DA-xxx`.
3. No agregues dependencias ni elijas stack sin autorización humana explícita.
4. Registra la interacción relevante en `prompts/` (`P-xxx`).
5. Mantén la nomenclatura de código en inglés y la documentación en español.

## 7. Trazabilidad

- `prompts/P-001-creacion-estructura-docs-ia.md`: creación original de `docs_ia`.
- `prompts/P-002-reestructuracion-docs-ia-frontend.md`: esta reestructuración (eliminación de
  contenido backend y creación de funcionalidades/diseño).
- `prompts/P-003-contrato-api-y-stack-frontend.md`: contrato de endpoints y propuesta de stack.
- `prompts/P-004-scaffolding-frontend.md`: implementación del stack aprobado (scaffolding).
- `decisiones/DA-001-stack-frontend.md`: stack del frontend (APROBADA e IMPLEMENTADA).
