# Portal de Proveedores · Frontend

Frontend del Portal de Proveedores de Naviera Transoceánica S.A. Implementa la Propuesta 1 del diseño: autenticación, registro de proveedores, consultas, registro de documentos, aprobaciones, contabilización y administración.

## Stack y versiones

| Componente | Versión |
|---|---|
| Angular (standalone, signals, `OnPush`) | 22.2 |
| TypeScript | 6.0 |
| Tailwind CSS (PostCSS) | 4.3 |
| Node.js | 24 LTS (≥ 24.15, ver `.nvmrc`) |
| npm | 11 |
| Pruebas unitarias | Karma + Jasmine |
| Reglas de arquitectura | dependency-cruiser + `scripts/check-source-layout.mjs` |

## Ejecución local

```bash
nvm use               # Node de .nvmrc
npm ci
npm start
```

Abrir [http://localhost:4200](http://localhost:4200). Todo el portal usa el backend (`http://localhost:5080/api`): levanta la API antes de iniciar sesión. El administrador inicial se configura en el `.env` del backend. Workflows de aprobación todavía no tiene API y guarda sus cambios en memoria mientras la pestaña esté abierta.

Para levantar todo junto (SQL Server, Azurite, API y este frontend), desde el repo del backend clonado al lado de este: `scripts/dev-up.sh`.

## Comandos

```bash
npm ci                # Instalación reproducible (usa package-lock.json)
npm start             # Servidor de desarrollo
npm run build         # Build de producción (también valida las plantillas)
npm test              # Pruebas unitarias (Karma, Chrome)
npm run quality       # Formato, tipos y reglas de arquitectura
npm run format        # Formatear TypeScript, HTML y CSS
```

Para CI: `npm ci && npm run quality && npx ng test --watch=false --browsers=ChromeHeadless && npm run build`.

**Artefacto:** `npm run build` genera el sitio estático en `dist/SAD-frontend-mock/browser/` (es lo que se publica).

## Configuración

La configuración por ambiente está en `src/environments/` y se elige al compilar (`environment.production.ts` reemplaza a `environment.ts` en el build de producción). No contiene secretos.

| Variable | Desarrollo | Producción | Uso |
|---|---|---|---|
| `apiBaseUrl` | `http://localhost:5080/api` | `/api` | URL base de la API |
| `features` | todas activas | todas apagadas | Funcionalidades visibles; las apagadas muestran «en construcción» |

## Integraciones

El frontend solo se comunica con la API del backend (`apiBaseUrl`), con JWT en la cabecera `Authorization`. SAP, SUNAT, correo y Blob Storage se consumen siempre a través del backend.

## Despliegue

- Sitio estático: copiar el contenido de `dist/SAD-frontend-mock/browser/` al sitio de IIS.
- Al ser una SPA, IIS debe reescribir las rutas internas a `index.html` (módulo URL Rewrite), sin reescribir `/api`.
- En producción la aplicación llama a `/api` en el mismo dominio: el servidor debe enrutar esa ruta al backend (o publicarlo en esa ruta).
- `index.html` no debe quedar en caché; los demás archivos llevan hash en el nombre.

## Estructura

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
src/environments/                   # Configuración por ambiente
src/styles.css                      # Tailwind y tokens de diseño (@theme)
```

## Documentación

- [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md): arquitectura («dónde va cada cosa», reglas, inyección, comunicación entre features), rutas, reglas de negocio y pendientes.
- [`docs/flujos/`](docs/flujos/README.md) y [`docs/specs/`](docs/specs/README.md): flujos de negocio y specs de cada cambio.
- [`docs/PLAN_HEXAGONAL.md`](docs/PLAN_HEXAGONAL.md): plan con el que se migró a esta estructura.
