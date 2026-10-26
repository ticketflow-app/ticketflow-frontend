# AGENTS.md — ticketflow-frontend

Frontend web de TicketFlow (interfaz de usuario de la plataforma de venta de boletos). Repo con código propio: Next.js + TypeScript.

> **Lee `.clinerules` completo antes de actuar**: es el archivo de reglas de este repo (roles `@architect`, `@reporter`, `@coder`, `@tester`, `@integrador` + secciones 0.1–11). Este `AGENTS.md` es el resumen operativo para OpenCode.
> La **fuente de verdad del proyecto es `docs_ia/contexto`**: el diseño, los requisitos y la arquitectura no se describen aquí.

## Estado

| Campo | Valor |
|---|---|
| Rol | Frontend web (UI de TicketFlow) |
| Stack | Next.js 16 (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query + Zustand + MSW (DA-001, APROBADA) |
| Consume | API Gateway a través del **BFF** de Next.js (`/api/*`); el gateway (`http://localhost:8080`) no lo llama el navegador |
| Backends | `ticketflow-user-service` (8081) y `ticketflow-inventory-service` (**8082**; la especificación de plataforma le asigna el 8083) |
| Dep. de | `docs_ia/contexto` (specs del frontend), API Gateway |
| Puerto dev | `http://localhost:3000` |
| Contrato HTTP | `docs_ia/contexto/contrato_api.md` |

## Contrato y endpoints

Detalle completo (endpoints consumidos, formas de datos, errores, huecos y contraste con la
especificación de plataforma): `docs_ia/contexto/contrato_api.md`.

| Método | Ruta (gateway) | Destino | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | user-service | pública |
| POST | `/api/auth/login` | user-service | pública |
| GET | `/api/usuarios/me` | user-service | Bearer |
| PATCH | `/api/usuarios/{id}/rol` | user-service | Bearer + `admin` |
| GET | `/api/inventario/eventos/{eventId}/disponibilidad` | inventory-service | Bearer (hoy **exige token**) |
| POST | `/api/reservas` | inventory-service | Bearer |

Contratos por backend: `ticketflow-user-service/docs_ia/contexto/contrato_api.md` y
`ticketflow-inventory-service/docs_ia/contexto/contrato_api.md`.

Puntos de contraste con la especificación de plataforma (`docs/Microservicios.docx`):

- **Ruta objetivo con `/api/`**: el gateway y los backends ahora exponen rutas bajo `/api/` (`/api/auth/**`, `/api/usuarios/**`, `/api/inventario/**`, `/api/reservas/**`, `/api/boletos/**`). El BFF ya reenvía con prefijo `/api/` hacia el gateway.
- Faltan los servicios de la spec: catálogo (listado/búsqueda/detalle de eventos), historial, detalle y cancelación de reservas → hoy se **simulan con MSW**.
- Sin `Idempotency-Key`, sin paginación y sin `X-Request-Id`.
- Errores con envoltorio `ApiResponse` (user) o JSON plano (inventory), no RFC 9457.

## Docs

- `docs_ia/README.md` — índice, estructura y decisiones pendientes del frontend.
- `docs_ia/contexto/` — specs **del frontend** (negocio, funcionalidades, diseño, requisitos, calidad, pruebas y contrato de API). No contiene arquitectura de backend ni pruebas de carga.
- `docs_ia/contexto/funcionalidades.md` — alcance funcional, roles, pantallas, flujos y prioridad.
- `docs_ia/contexto/diseno.md` — principios UI/UX, navegación, pantallas, componentes y estados.
- `docs_ia/contexto/contrato_api.md` — **contrato HTTP vigente**: endpoints reales, auth, errores, huecos, patrón BFF y contraste con la especificación de plataforma.
- `docs_ia/contexto/contexto_negocio.md`, `requisitos/`, `calidad/`, `pruebas/` — el resto del contexto.
- `docs_ia/decisiones/` — decisiones arquitectónicas (`DA-xxx`); `DA-001-stack-frontend.md`.
- `docs_ia/prompts/` — trazabilidad de uso de IA (`P-xxx`).

> El stack y la arquitectura base están definidos en `docs_ia/decisiones/DA-001-stack-frontend.md`
> (APROBADA e IMPLEMENTADA). Cualquier cambio arquitectónico posterior debe proponerse como una
> nueva `DA-xxx` y esperar aprobación humana.

## Comandos

```powershell
npm run dev          # servidor de desarrollo en http://localhost:3000
npm run build        # build de producción
npm run start        # servir el build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (unitarias/componentes con MSW)
npm run test:watch   # Vitest en modo watch
npm run test:e2e     # Playwright (requiere `npx playwright install`)
```

## Gobernanza (para OpenCode)

> Adaptación para **OpenCode** de `.clinerules` (secciones 1–11). Las reglas completas, incluidos los roles y la sección 11 (gestión de tareas), están en `.clinerules`; léelo completo antes de tareas relevantes. La fuente de verdad es `docs_ia/contexto`.

### 1. Fuente de contexto

- `docs_ia/contexto` es la **única fuente autorizada** para: requisitos, atributos de calidad, arquitectura, diseño, estrategia de pruebas y restricciones del proyecto.
- No asumir información que no esté definida en `docs_ia/contexto`.
- Antes de una tarea relevante, revisar los archivos de `docs_ia/contexto` necesarios para esa tarea.
- Si falta información, distinguir entre el hecho conocido, la inferencia y la propuesta; si la tarea entra en conflicto con el contexto, detener el cambio afectado y pedir aclaración.

### 2. Decisiones arquitectónicas

- No tomar decisiones arquitectónicas importantes de forma autónoma.
- Cuando haga falta decidir, analizar alternativas y proponer una recomendación.
- Crear la propuesta en `docs_ia/decisiones/` en Markdown, usando el siguiente identificador `DA-xxx` disponible.
- Esperar aprobación humana antes de implementar la decisión propuesta.
- Una decisión aprobada queda documentada en `docs_ia/decisiones/`.
- No sobrescribir decisiones anteriores; si una decisión cambia, crear una nueva que explique el cambio.
- Cada decisión debe incluir: contexto, problema, alternativas consideradas, recomendación, ventajas, desventajas, impacto y estado.
- Estado `PROPUESTA` hasta recibir aprobación humana explícita; solo entonces `APROBADA` y aplicable.

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
- Documentación de proyecto en **español**; código y comentarios técnicos en **inglés**.

### 5. Pruebas

- No modificar la estrategia de pruebas definida en `docs_ia/contexto` sin proponerlo antes.
- Cuando corresponda, crear o modificar pruebas junto con el código.
- No introducir nuevas herramientas o frameworks de pruebas sin analizar antes su necesidad y compatibilidad.
- Las pruebas deben verificar comportamientos concretos, no limitarse a confirmar que los componentes existen.

### 6. Gestión de dependencias

- Antes de agregar, eliminar, actualizar o reemplazar una dependencia, revisar los archivos relevantes de `docs_ia/contexto`.
- Revisar siempre el manifiesto de dependencias actual (`package.json`) antes de proponer cambios.
- Clasificar las dependencias como: indispensables, recomendadas, opcionales o no justificadas actualmente.
- Para cada dependencia propuesta indicar: propósito, funcionalidad, relación con la arquitectura, requisito que satisface, alternativas, impacto técnico y compatibilidad con las versiones actuales.
- Verificar compatibilidad con: versión del runtime/lenguaje (Node.js), versión del framework, versión del gestor de paquetes y arquitectura definida.
- No agregar dependencias por conveniencia, costumbre o sugerencia automática de una herramienta.
- Principio de mínima dependencia: solo las justificadas por requisitos y arquitectura aprobada.
- **No agregar, eliminar, actualizar ni modificar dependencias sin autorización humana explícita.**
- Antes de modificar el manifiesto, presentar análisis y propuesta; tras la autorización, aplicar solo lo aprobado.
- Toda modificación importante de dependencias se documenta en `docs_ia/decisiones`.

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
- Si la tarea requiere una decisión no definida en `docs_ia/contexto`, detener la implementación y presentar la decisión.
- El permiso de lectura no implica permiso de escritura: cada cambio debe caer dentro del alcance autorizado.

### 9. Comunicación

- Explicar las decisiones de forma breve y técnica.
- Si falta información en `docs_ia/contexto`, indicarlo explícitamente.
- Diferenciar siempre entre: información definida, suposición, propuesta y decisión aprobada.
- Presentar las alternativas técnicamente válidas antes de elegir una.
- No presentar una propuesta como si fuera una decisión aprobada.
- Informar qué archivos se modificarán antes de cambios importantes.
- Tras cambios autorizados, informar: archivos modificados, cambios realizados, comandos ejecutados, pruebas realizadas, resultado y pendientes.

### 10. Trazabilidad del uso de IA

- Toda interacción relevante debe quedar registrada, incluso si es solo análisis sin cambios de código.
- Se registra desde que se ejecuta el prompt y no requiere autorización.
- Ubicación: `docs_ia/prompts`, un archivo Markdown independiente por interacción, con identificadores consecutivos `P-001`, `P-002`, ...
- Contenido mínimo: identificador, fecha, objetivo, prompt completo, archivos de contexto consultados, archivos analizados, resumen de la respuesta, propuestas, decisiones pendientes y estado.
- Estados permitidos: `ANALISIS` | `PROPUESTA` | `APROBADO` | `RECHAZADO` | `IMPLEMENTADO`.
- Si hay propuesta arquitectónica o técnica, crear también el documento correspondiente en `docs_ia/decisiones`.
- El registro de trazabilidad y la propuesta documental **no** autorizan a modificar código, configuración, dependencias o infraestructura.
- Ningún archivo (salvo trazabilidad y propuestas) se modifica sin autorización humana explícita.
- Si solo se pide análisis, ejecutarlo y documentarlo sin tocar código.
- Si luego se autoriza, actualizar el registro con autorización, cambios, archivos, comandos, pruebas, resultado y estado final.
- Nunca sobrescribir registros históricos; si algo cambia, crear un nuevo registro relacionado.
- La trazabilidad debe permitir reconstruir: Contexto → Prompt → Respuesta IA → Propuesta → Autorización humana → Implementación → Pruebas → Resultado.

## Grafo (codebase-memory)

- Proyecto de grafo: `C-Users-Juan-Diego-Duque-Documents-Programacion-ticketflow-ticketflow-frontend`.
- Este repo es git → `detect_changes --base-branch main` funciona contra este proyecto.
- Arquitectura entre servicios → grafo padre `C-Users-Juan-Diego-Duque-Documents-Programacion-ticketflow` (foto del estado actual de los 5 checkouts).
- **Cambiar de rama NO refresca este grafo automáticamente** (el watcher sigue la raíz, que no es git). Tras `git checkout` o al editar, fuerza re-index:
  ```powershell
  powershell -File ..\sync-graph.ps1 -Service ticketflow-frontend   # desde la raíz
  ```
  o, desde esta carpeta: `index_repository --repo-path . --mode full`.

## Gotchas

- **El navegador nunca llama al gateway**: el BFF de Next.js (`src/app/api/auth/*` y `src/app/api/gateway/[...path]/route.ts`) reenvía al gateway y adjunta el token. Detalle en `docs_ia/contexto/contrato_api.md`.
- **Token en cookie `httpOnly`** (`AUTH_COOKIE_NAME`, por defecto `tf_token`): se guarda al hacer login y no es accesible desde JavaScript. El layout resuelve la sesión en el servidor (`getCurrentUser`) y la inyecta en Zustand.
- **MSW** (`src/mocks/handlers.ts`, `data.ts`, `server.ts`, `browser.ts`) simula los endpoints que el backend aún no expone (catálogo, detalle, disponibilidad pública e historial) cuando `NEXT_PUBLIC_API_MOCKING=enabled`.
- **Variables de entorno**: `API_GATEWAY_URL` (servidor), `AUTH_COOKIE_NAME`, `NEXT_PUBLIC_API_MOCKING`, `NEXT_PUBLIC_API_BASE_URL`. Ver `.env.example`.
- **Estructura**: `src/app` (rutas App Router + Route Handlers del BFF), `src/components` (UI shadcn + layout), `src/features` (`auth`, `events`, `reservations`: api + hooks + componentes), `src/lib` (`api`, `auth`, config, formato), `src/mocks`, `src/stores` (Zustand), `src/test` (setup de Vitest); `e2e/` (Playwright).
- **Pruebas E2E**: eliminadas de este repositorio. Se gestionarán en un repositorio independiente para orquestar todo el stack (gateway + servicios backend + frontend).
- El gateway solo habilita CORS para `http://localhost:8081`: el frontend (`:3000`) no sufre por eso porque las llamadas al gateway salen del servidor (BFF).
- `docs_ia/contexto/diseno.md` **no define** el stack ni la librería de componentes: eso está en `DA-001`.
- **Rutas con `/api/`**: el BFF reenvía las rutas con prefijo `/api/` al gateway (`/api/auth/**`, `/api/usuarios/**`, `/api/inventario/**`, `/api/reservas/**`). El gateway enruta hacia los servicios correspondientes.
- **`inventory-service` corre en el 8082** (la especificación le asigna el 8083): si aparece un `catalogo-service`, el 8082 pasa a ser suyo y este servicio se mueve al 8083.
- El contrato por backend está en `ticketflow-<servicio>/docs_ia/contexto/contrato_api.md`; **este repo no lo replica**: consúltalo allí antes de cambiar un tipo o una ruta.

## No tocar

- `node_modules/`, `.next/`, `out/`, `coverage/` = output de build/dependencias.
- `.env.local` y secretos: no los copies entre máquinas ni los subas al repo.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
