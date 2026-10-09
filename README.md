# Portal de Proveedores · Frontend

Frontend Angular 20 + Tailwind CSS 4 del Portal de Proveedores de Naviera Transoceánica S.A. Implementa la Propuesta 1 del diseño: autenticación, registro de proveedores, consultas, registro de documentos, aprobaciones, contabilización y administración.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Levantar todo (backend + frontend)

Desde el repo del backend, clonado al lado de este: `scripts/dev-up.sh` (SQL Server, API y este frontend con un solo comando).

## Instalación y arranque

```bash
npm install
npm start
```

Abrir [http://localhost:4200](http://localhost:4200).

> Consulta [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) antes de continuar el desarrollo: describe la arquitectura, las rutas, los roles y qué partes siguen en memoria.

## Acceso

Todo el portal usa el backend (`http://localhost:5080/api`): levanta la API antes de iniciar sesión. El administrador inicial se configura en el `.env` del backend. Workflows de aprobación todavía no tiene API y guarda sus cambios en memoria mientras la pestaña esté abierta.

## Comandos útiles

```bash
npm start             # Servidor de desarrollo
npm run build         # Compilación de producción (también valida las plantillas)
npm run quality       # Formato, tipos y reglas de arquitectura
npm run format        # Formatear TypeScript, HTML y CSS
npm test              # Ejecutar pruebas (Karma)
```

## Configuración de producción

En producción la aplicación llama a `/api` (ver `src/environments/environment.production.ts`); el servidor que la publique debe enrutar esa ruta al backend.

## Estructura principal

Arquitectura hexagonal por feature; las reglas entre capas las verifica `npm run quality`.

```text
src/app/
├── app.config.ts · app.routes.ts   # Providers raíz y rutas (cada feature exporta las suyas)
├── core/                           # Configuración (API_BASE_URL, feature flags), errores HTTP y layout
├── shared/                         # Componentes UI, errores y utilidades (sin dependencias de core ni features)
└── features/<feature>/             # auth, menus, home, profile, catalog, payments, documents,
    ├── domain/                     #   societies, areas, users, roles, workflows
    ├── application/                # Puertos (in/out) y casos de uso
    ├── infrastructure/             # Adaptadores HTTP, mappers y DTO
    ├── presentation/               # Páginas, componentes y facades
    ├── di/                         # Tokens y providers
    └── index.ts                    # API pública de la feature
src/styles.css                      # Tailwind y tokens de diseño (@theme)
```

## Documentación para agentes

La guía de arquitectura («dónde va cada cosa», reglas, inyección, comunicación entre features), rutas, reglas de negocio y pendientes está en [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md). El plan con el que se migró a esta estructura está en [`docs/PLAN_HEXAGONAL.md`](docs/PLAN_HEXAGONAL.md).
