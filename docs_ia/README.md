# docs_ia — ticketflow-frontend

Esta carpeta es la **única fuente autorizada de contexto** para trabajar en el frontend de TicketFlow
(ver `.clinerules` en la raíz del repo). No asumas información que no esté aquí; si falta algo,
indícalo explícitamente y propón una decisión en `decisiones/`.

## Qué se copió y de dónde

El contenido de `contexto/` es **especificación de plataforma** (aplica a todo TicketFlow, no solo al
backend). Se copió **idéntico byte a byte** desde `ticketflow-user-service/docs_ia`, que es la copia
"limpia" compartida; los servicios backend tienen exactamente los mismos archivos.

## Estructura

```
docs_ia/
├── contexto/                        # fuente autorizada (specs de plataforma)
│   ├── contexto_negocio.md          # negocio, alcance, actores, reglas (RB-xx), calidad, metodología
│   ├── arquitectura/
│   │   ├── arquitectura.md          # arquitectura general del sistema (microservicios, gateway, AWS, comunicación)
│   │   └── desiciones_arquitectonicas.md   # ADR-001.. de plataforma (microservicios, hexagonal, Redis, PostgreSQL, JWT)
│   ├── calidad/
│   │   ├── atributos_calidad.md     # atributos priorizados (escalabilidad, disponibilidad, latencia...)
│   │   └── escenarios_calidad.md    # escenarios de calidad
│   ├── pruebas/
│   │   ├── estrategia_pruebas.md
│   │   └── pruebas_cargas.md
│   └── requisitos/
│       ├── epicas_feactures.md      # épicas E1..E7 + features y priorización MVP
│       ├── historias_usuarios.md    # historias de usuario (registro, eventos, reservas, carga, etc.)
│       └── casos_uso.md             # casos de uso
├── decisiones/
│   └── README.md                    # convención: DA-xxx-<titulo>.md, no sobrescribir
└── prompts/
    └── README.md                    # convención: P-xxx-<titulo>.md (trazabilidad de uso de IA)
```

## Pendiente de definir para el frontend

Estos `contexto/*` describen el **sistema** (requisitos y arquitectura de plataforma). **No** definen
el frontend, y `.clinerules` prohíbe asumir o decidir arquitectura de forma autónoma. Por tanto,
todavía **no está definido**:

- **Stack del frontend** (framework, lenguaje, build tool, gestor de paquetes).
- **Arquitectura del frontend** (estructura de carpetas, manejo de estado, routing, capa de acceso a API,
  autenticación con JWT, manejo de errores/reintentos).
- **Estrategia de pruebas de frontend** (unitarias, componentes, E2E, mocks de API).
- **Contrato de consumo del API Gateway** desde el frontend (rutas, CORS — hoy el gateway solo permite
  `http://localhost:8081`).

Cuando se aborden, deben proponerse como `decisiones/DA-xxx-<titulo>.md` en estado `PROPUESTA` y esperar
aprobación humana antes de implementar. Mientras tanto, `contexto/pruebas/*` y
`contexto/arquitectura/arquitectura.md` deben leerse como contexto de plataforma, no como diseño del frontend.

## Reglas clave (resumen; ver `.clinerules`)

- `contexto/` es la única fuente de verdad de requisitos/arquitectura/calidad/pruebas.
- Decisiones arquitectónicas → proponer en `decisiones/DA-xxx` (`PROPUESTA`) y esperar aprobación humana.
- Trazabilidad de cada interacción relevante → `prompts/P-xxx` (incluso análisis sin cambios).
- Dependencias: **no** agregar/quitar/actualizar sin autorización humana explícita.
- Código, identificadores y comentarios **en inglés**; documentación de proyecto en español.
