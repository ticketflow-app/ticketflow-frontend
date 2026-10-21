# TicketFlow — Frontend

Interfaz web de **TicketFlow**, la plataforma de venta de boletos para eventos de alta demanda.
Construida con Next.js y un **BFF** (Backend For Frontend) que evita exponer el JWT al navegador.

## Stack

| Área | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos / UI | Tailwind CSS + shadcn/ui (Base UI) |
| Datos / estado | TanStack Query + Zustand |
| Mocks | MSW |
| Pruebas | Vitest + React Testing Library (+ Playwright) |
| Paquetes | npm |

Decisiones: `docs_ia/decisiones/DA-001-stack-frontend.md`.
Contrato de API consumido: `docs_ia/contexto/contrato_api.md`.

## Comandos

```powershell
npm install          # instalar dependencias
npm run dev          # desarrollo en http://localhost:3000
npm run build        # build de producción
npm run start        # servir el build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest
npm run test:e2e     # Playwright (requiere `npx playwright install`)
```

## Configuración

Copia `.env.example` a `.env.local` y ajusta si hace falta:

| Variable | Uso |
|---|---|
| `API_GATEWAY_URL` | URL del API Gateway (solo servidor; por defecto `http://localhost:8080`) |
| `AUTH_COOKIE_NAME` | Nombre de la cookie `httpOnly` con el JWT |
| `NEXT_PUBLIC_API_MOCKING` | `enabled` activa MSW para los endpoints que el backend aún no expone |
| `NEXT_PUBLIC_API_BASE_URL` | Origen absoluto para las llamadas al BFF (vacío en el navegador) |

## Arquitectura

- El navegador **nunca** llama al gateway: usa el BFF bajo `/api/*`.
- `POST /api/auth/login` guarda el token en una cookie `httpOnly`; el resto de llamadas
  (`/api/gateway/[...path]`) lo adjuntan como `Authorization: Bearer`.
- El layout resuelve la sesión en el servidor y la inyecta en Zustand.
- **MSW** simula catálogo, detalle, disponibilidad e historial mientras el backend no los expone.

```
src/
├── app/          # rutas (App Router) + Route Handlers del BFF
├── components/   # UI (shadcn) y layout
├── features/     # auth, events, reservations
├── lib/          # api, auth, config, format
├── mocks/        # MSW
├── stores/       # Zustand
└── test/         # setup de Vitest
e2e/              # Playwright
```

La gobernanza del repo (fuente de requisitos, decisiones y trazabilidad) está en `AGENTS.md` y
`docs_ia/`.
