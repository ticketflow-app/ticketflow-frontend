# AGENTS.md — ticketflow-frontend

Frontend web de TicketFlow (interfaz de usuario de la plataforma de venta de boletos). Repo recién clonado: **aún no tiene código ni stack definido**. Gobernado por este `AGENTS.md` + `docs_ia` (el repo conserva también `.clinerules`, la versión equivalente para Cline).

## Estado

| Campo | Valor |
|---|---|
| Rol | Frontend web (UI de TicketFlow) |
| Stack | Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query + Zustand + MSW (DA-001, APROBADA) |
| Consume | API Gateway a través del **BFF** de Next.js (`/api/*`); el gateway (`http://localhost:8080`) no lo llama el navegador |
| Dep. de | `docs_ia/contexto` (specs del frontend), API Gateway |
| Puerto dev | `http://localhost:3000` |

> El stack y la arquitectura base están definidos en `docs_ia/decisiones/DA-001-stack-frontend.md`
> (APROBADA e IMPLEMENTADA). Cualquier cambio arquitectónico posterior debe proponerse como una
> nueva `DA-xxx` y esperar aprobación humana.

## Docs

- `docs_ia/README.md` — índice, estructura y decisiones pendientes del frontend.
- `docs_ia/contexto/` — specs **del frontend** (negocio, funcionalidades, diseño, requisitos,
  calidad, pruebas y contrato de API). No contiene arquitectura de backend ni pruebas de carga.
- `docs_ia/contexto/funcionalidades.md` — alcance funcional, roles, pantallas, flujos y prioridad.
- `docs_ia/contexto/diseno.md` — principios UI/UX, navegación, pantallas, componentes y estados.
- `docs_ia/contexto/contrato_api.md` — endpoints reales, auth, errores y huecos del backend.
- `docs_ia/decisiones/` — decisiones arquitectónicas (`DA-xxx`).
- `docs_ia/prompts/` — trazabilidad de uso de IA (`P-xxx`).

## Comandos

```powershell
npm run dev          # servidor de desarrollo en http://localhost:3000
npm run build        # build de producción
npm run start        # servir el build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (unitarias/componentes con MSW)
npm run test:e2e     # Playwright (requiere `npx playwright install`)
```

## Arquitectura del frontend

- **BFF (Backend For Frontend)**: el navegador nunca llama al gateway. `src/app/api/auth/*` y
  `src/app/api/gateway/[...path]/route.ts` reenvían al gateway y adjuntan el token.
- **Token en cookie `httpOnly`**: se guarda al hacer login y no es accesible desde JavaScript.
  El layout resuelve la sesión en el servidor (`getCurrentUser`) y la inyecta en Zustand.
- **MSW**: simula los endpoints que el backend aún no expone (catálogo, detalle, disponibilidad
  pública e historial) cuando `NEXT_PUBLIC_API_MOCKING=enabled`.
- **Variables de entorno**: `API_GATEWAY_URL` (servidor), `AUTH_COOKIE_NAME`,
  `NEXT_PUBLIC_API_MOCKING`, `NEXT_PUBLIC_API_BASE_URL`. Ver `.env.example`.

### Estructura

```
src/
├── app/          # rutas Next.js (App Router) + Route Handlers del BFF
├── components/   # UI (shadcn) y layout
├── features/     # auth, events, reservations (api + hooks + componentes)
├── lib/          # api (client/BFF/gateway), auth (sesión), config, formato
├── mocks/        # MSW: handlers, datos y worker
├── stores/       # Zustand (sesión)
└── test/         # setup de Vitest
e2e/              # pruebas Playwright
```

## Gobernanza (para OpenCode)

> Versión para **OpenCode** de la gobernanza de TicketFlow (este repo también conserva `.clinerules`, la versión para Cline). Aplica a todo el trabajo en este repo; su fuente de verdad es `/docs_ia/contexto`.

### 1. Fuente de contexto

- `/docs_ia/contexto` es la **única fuente autorizada** para: requisitos, atributos de calidad, arquitectura, diseño, estrategia de pruebas y restricciones del proyecto.
- No asumir información que no esté definida en `/docs_ia/contexto`.
- Antes de una tarea relevante, revisar los archivos de `/docs_ia/contexto` necesarios para esa tarea.

### 2. Decisiones arquitectónicas

- No tomar decisiones arquitectónicas importantes de forma autónoma.
- Cuando haga falta decidir, analizar alternativas y proponer una recomendación.
- Crear la propuesta en `/docs_ia/decisiones` en Markdown.
- Esperar aprobación humana antes de implementar una decisión propuesta.
- Una decisión aprobada queda documentada en `/docs_ia/decisiones`.

### 3. Código

- Puede leer y modificar el código cuando la tarea haya sido aprobada.
- No hacer cambios importantes basados en suposiciones.
- Antes de cambios arquitectónicos, explicar brevemente qué se modificará y por qué.
- Mantener coherencia con las decisiones aprobadas.
- Nomenclatura **en inglés**: variables, funciones, clases, componentes, interfaces, módulos, servicios, endpoints, DTOs, tipos y archivos de código.
- Comentarios y documentación técnica dentro del código, **en inglés**.
- No usar nombres en español en el código, salvo nombres externos obligados por una API, librería o requisito existente.
- Nomenclatura consistente y descriptiva según el lenguaje y framework.

### 4. Documentación

- Toda decisión arquitectónica o técnica importante se documenta en Markdown.
- Identificadores consecutivos: `DA-001`, `DA-002`, `DA-003`, ...
- No sobrescribir decisiones anteriores; si una decisión cambia, crear una nueva que explique el cambio.
- Cada decisión debe incluir: contexto, problema, alternativas consideradas, recomendación, ventajas, desventajas, impacto y estado.
- Estado `PROPUESTA` hasta recibir aprobación humana explícita; solo entonces `APROBADA` y aplicable.

### 5. Pruebas

- No modificar la estrategia de pruebas definida en `/docs_ia/contexto` sin proponerlo antes.
- Cuando corresponda, crear o modificar pruebas junto con el código.
- No introducir nuevas herramientas o frameworks de pruebas sin analizar antes su necesidad y compatibilidad.

### 6. Gestión de dependencias

- Antes de agregar, eliminar, actualizar o reemplazar una dependencia, revisar los archivos relevantes de `/docs_ia/contexto`.
- Revisar siempre el manifiesto de dependencias actual (`package.json` o el equivalente del stack elegido) antes de proponer cambios.
- Clasificar las dependencias como: indispensables, recomendadas, opcionales o no justificadas actualmente.
- Para cada dependencia propuesta indicar: propósito, funcionalidad, relación con la arquitectura, requisito que satisface, alternativas, impacto técnico y compatibilidad con las versiones actuales.
- Verificar compatibilidad con: versión del runtime/lenguaje (Node.js o equivalente), versión del framework, versión del gestor de paquetes y arquitectura definida.
- No agregar dependencias por conveniencia, costumbre o sugerencia automática de una herramienta.
- Principio de mínima dependencia: solo las justificadas por requisitos y arquitectura aprobada.
- **No agregar, eliminar, actualizar ni modificar dependencias sin autorización humana explícita.**
- Antes de modificar el manifiesto, presentar análisis y propuesta; tras la autorización, aplicar solo lo aprobado.
- Toda modificación importante de dependencias se documenta en `/docs_ia/decisiones`.

### 7. Uso de herramientas

- Puede leer archivos; crear y modificar cuando la tarea esté aprobada; ejecutar comandos necesarios para la tarea aprobada.
- No ejecutar comandos que modifiquen el proyecto sin autorización cuando los cambios no estén aprobados.
- Pedir aprobación antes de comandos destructivos o peligrosos y antes de instalar paquetes, dependencias, herramientas o software.
- No eliminar archivos, dependencias, configuraciones o código sin autorización explícita.
- Si una herramienta propone cambios automáticos, analizar primero y pedir autorización antes de aplicarlos.

### 8. Autorización de cambios

- Toda tarea que modifique código, configuración, arquitectura, dependencias o infraestructura requiere autorización humana si no estaba previamente aprobada.
- Analizar primero, modificar después.
- Una autorización específica no autoriza cambios adicionales no relacionados.
- No interpretar expresiones ambiguas como autorización para cambios importantes.
- Si la tarea requiere una decisión no definida en `/docs_ia/contexto`, detener la implementación y presentar la decisión.

### 9. Comunicación

- Explicar las decisiones de forma breve y técnica.
- Si falta información en `/docs_ia/contexto`, indicarlo explícitamente.
- Diferenciar siempre entre: información definida, suposición, propuesta y decisión aprobada.
- Presentar las alternativas técnicamente válidas antes de elegir una.
- No presentar una propuesta como si fuera una decisión aprobada.
- Informar qué archivos se modificarán antes de cambios importantes.
- Tras cambios autorizados, informar: archivos modificados, cambios realizados, comandos ejecutados, pruebas realizadas, resultado y pendientes.

### 10. Trazabilidad del uso de IA

- Toda interacción relevante debe quedar registrada, incluso si es solo análisis sin cambios de código.
- Se registra desde que se ejecuta el prompt y no requiere autorización.
- Ubicación: `/docs_ia/prompts`, un archivo Markdown independiente por interacción, con identificadores consecutivos `P-001`, `P-002`, ...
- Contenido mínimo: identificador, fecha, objetivo, prompt completo, archivos de contexto consultados, archivos analizados, resumen de la respuesta, propuestas, decisiones pendientes y estado.
- Estados permitidos: `ANALISIS` | `PROPUESTA` | `APROBADO` | `RECHAZADO` | `IMPLEMENTADO`.
- Si hay propuesta arquitectónica o técnica, crear también el documento correspondiente en `/docs_ia/decisiones`.
- El registro de trazabilidad y la propuesta documental **no** autorizan a modificar código, configuración, dependencias o infraestructura.
- Ningún archivo (salvo trazabilidad y propuestas) se modifica sin autorización humana explícita.
- Si solo se pide análisis, ejecutarlo y documentarlo sin tocar código.
- Si luego se autoriza, actualizar el registro con autorización, cambios, archivos, comandos, pruebas, resultado y estado final.
- Nunca sobrescribir registros históricos; si algo cambia, crear un nuevo registro relacionado.
- La trazabilidad debe permitir reconstruir: Contexto → Prompt → Respuesta IA → Propuesta → Autorización humana → Implementación → Pruebas → Resultado.

## Grafo (codebase-memory)

- Proyecto de grafo: `frontend` (el repo ya tiene código: **indexar** con
  `index_repository(repo_path="ticketflow-frontend", mode="full", name="frontend")`).
- Este repo es git → `detect_changes --base-branch main` funcionará contra este proyecto cuando esté indexado.
- Arquitectura entre servicios → consulta cada proyecto por separado y correlaciona tú; **no hay proyecto padre**.
- **Cambiar de rama NO refresca el grafo automáticamente** (el watcher sigue la raíz, que no es git). Tras `git checkout` o editar, fuerza re-index: `index_repository(repo_path="ticketflow-frontend", mode="full", name="frontend")`.
- Sincronización global: `pwsh -File .\sync-graph.ps1` desde la raíz (hoy re-indexa los 4 servicios backend; añade el frontend cuando se incorpore al script).

## No tocar

- Artefactos de build/dependencias según el stack elegido (p. ej. `node_modules/`, `dist/`) = output, no código fuente.
