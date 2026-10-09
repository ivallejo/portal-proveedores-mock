# Plan: frontend con arquitectura hexagonal

Objetivo: reorganizar `src/app` por feature con capas `domain`, `application` (puertos `in`/`out` y casos de uso), `infrastructure` (adaptadores HTTP, DTO y mappers) y `presentation` (páginas, componentes, facades, guards). Se aplica SRP, ISP y DIP sin cambiar el comportamiento: mismas rutas, mismas pantallas, mismas llamadas a la API.

Cada paso deja la app compilando y funcionando, y se cierra con un commit. La guía de estructura es la que se acordó (ver sección 3).

## 1. Diagnóstico

**Lo que ya está bien (se conserva):** Angular 20 standalone con signals y `OnPush`, rutas con lazy loading y guards, feature flags, `shared/ui` reutilizable, Tailwind con tokens y textos en español.

| # | Problema | Principio | Ejemplos |
|---|---|---|---|
| F1 | Servicios que mezclan modelos, DTO de la API y llamadas HTTP | SRP | `users.service.ts` (9 tipos), `access.service.ts`, `organization.service.ts`, `profile.service.ts`, `catalog.service.ts`, `invoice-status.service.ts`: `export interface` junto al `@Injectable` |
| F2 | Las páginas dependen de servicios HTTP concretos | DIP | `inject(OrganizationService)`, `inject(DocumentsService)`, `inject(UsersService)`… No hay puertos: cambiar la API o usar un mock obliga a tocar la página |
| F3 | Servicios grandes que exponen todo a todos | ISP | `AuthService` (login, sesión, roles, contraseñas, `localStorage`); `DocumentsService` (bandejas, detalle, aprobar, rechazar, reasignar, observar, descargar) |
| F4 | Lógica de negocio y estado dentro de componentes muy grandes | SRP | `register-document-page` (738 líneas, 5 tipos internos), `users-page` (630), `profile-page` (368), `approvals-page` (335) |
| F5 | Varios componentes o tipos en un archivo | SRP | `feedback.components.ts` (5), `auth-ui.components.ts` (4), `page.components.ts` (3), `document.model.ts` (14 exportaciones), `format.ts` (11) |
| F6 | Dependencias en sentido incorrecto y ciclos | DIP | `core/auth` ↔ `core/layout`; `features/auth` ↔ `features/profile`; `shared/data` → `core/auth` (shared depende de core) |
| F7 | Detalles de infraestructura repartidos | DIP | `localStorage` en `AuthService` y en el interceptor; `environment.apiBaseUrl` importado en 13 archivos |
| F8 | Una funcionalidad repartida en varias carpetas | Cohesión | Documentos: `shared/documents` + `approvals` + `accounting` + `register-document`; sesión: `core/auth` + `features/auth` + `shared/models` + `features/providers` |
| F9 | Casi sin pruebas y sin reglas que protejan la estructura | — | Un solo `app.spec.ts`; nada impide que una página importe un adaptador HTTP |

## 2. De dónde a dónde

| Hoy | Feature destino |
|---|---|
| `features/auth`, `core/auth` (servicio, guards, interceptor), `features/providers`, `shared/models` (User, Role) | `features/auth` |
| `core/layout/menu.service.ts`, `core/layout/navigation.ts`, `settings/access/menus-page` | `features/menus` (menú de la sesión y Configuración › Menús) |
| `settings/access/roles-page` y su parte de `access.service.ts` | `features/roles` |
| `settings/organization/companies-page` | `features/societies` |
| `settings/organization/areas-page` | `features/areas` |
| `settings/users` | `features/users` |
| `features/profile` y `auth/pages/verify-email-page` | `features/profile` (rompe el ciclo auth ↔ profile) |
| `shared/data/catalog.service.ts` | `features/catalog` (sociedades, áreas y aprobadores del usuario) |
| `payment-orders`, `invoice-status`, `shared/data/supplier-scope.ts` | `features/payments` (dos páginas) |
| `shared/documents`, `approvals`, `accounting`, `register-document` | `features/documents` (registro, bandeja de aprobación, contabilización) |
| `workflows`, `shared/state/mock-users.store.ts` | `features/workflows` (adaptador en memoria detrás de un puerto) |
| `home`, `under-construction` | `features/home`, `core/layout/under-construction` |
| `core/layout/shell` | `core/layout/{app-shell,header,sidebar}` |
| `core/config/features.ts`, `environment.apiBaseUrl` | `core/config` (`API_BASE_URL`, `FEATURE_FLAGS` como `InjectionToken`) |
| `shared/utils/api-errors.ts` | `core/http` |

Las URLs no cambian (`/configuracion/sociedades`, `/registrar-documento`…): cada feature exporta sus rutas en `<feature>.routes.ts` y `app.routes.ts` las monta con las mismas rutas.

## 3. Estructura objetivo

```text
src/app/
├── app.ts · app.html · app.config.ts · app.routes.ts
├── core/
│   ├── config/        api-base-url.token.ts, feature-flags.ts
│   ├── http/          api-error.ts (lectura del message del backend)
│   └── layout/        app-shell/, header/, sidebar/, page-loading.service.ts, under-construction/
├── shared/
│   ├── ui/            un componente por carpeta (.ts + .html): badge, select, dialog, confirm-dialog, drawer, toast, callout, empty-state, result, loading, progress, page-header, kpi, pagination, spinner, date-range, icon
│   ├── forms/         validators/ (RUC, correo, contraseña) y form-error/
│   └── utils/         date-format.util.ts, money-format.util.ts, text.util.ts…
└── features/<feature>/
    ├── domain/            models/, value-objects/ (sin Angular ni RxJS)
    ├── application/
    │   ├── models/        commands y resultados
    │   ├── ports/in/      un puerto por caso de uso (interfaz)
    │   ├── ports/out/     puertos pequeños hacia afuera (interfaz)
    │   └── use-cases/     implementaciones (dependen solo de ports/out)
    ├── infrastructure/
    │   ├── http/          <x>-http.adapter.ts y dto/
    │   ├── mappers/       DTO ↔ dominio
    │   └── (session/, xml/, memory/ según el adaptador)
    ├── presentation/
    │   ├── pages/         componentes de ruta (.ts + .html)
    │   ├── components/    piezas de la página
    │   ├── facades/       estado de la pantalla (signals) y orquestación de casos de uso
    │   └── guards/ · interceptors/ (solo en auth y menus)
    ├── di/                <feature>.tokens.ts (InjectionToken de cada puerto) y <feature>.providers.ts
    ├── <feature>.routes.ts
    └── index.ts           API pública: lo único que otras features pueden importar
```

**Reglas** (las 1 a 6 las verifica `dependency-cruiser`, desde el paso 1; la 7, un script propio desde el paso 3):

1. `domain` no importa Angular, RxJS ni otras capas.
2. `application` importa solo `domain` y sus propios puertos (RxJS permitido para `Observable`). Nunca `HttpClient`, `localStorage` ni `infrastructure`.
3. `infrastructure` implementa `ports/out`; es la única capa que usa `HttpClient`, `localStorage` o `environment`.
4. `presentation` usa `ports/in` (a través de los tokens de `di/`) y `domain`; nunca `infrastructure`.
5. Una feature importa otra solo por su `index.ts`. Sin ciclos entre features.
6. `shared` no importa `core` ni `features`. `core` solo importa la API pública de las features que compone (`auth` y `menus` para el shell).
7. Un componente, servicio o modelo por archivo; plantillas en `.html`. Sin SCSS: se mantiene Tailwind (regla de `CLAUDE.md`).

Inyección: cada puerto es una `interface` con su `InjectionToken` en `di/<feature>.tokens.ts`, y `di/<feature>.providers.ts` enlaza puerto → caso de uso → adaptador. Las rutas de la feature cargan sus providers (`providers: [...]` en la ruta), así cada feature se instancia solo cuando se abre.

## 4. Verificación en cada paso

- `npm run quality` (formato y tipos), `npm run build` y `npm test` (Karma en Chrome headless).
- `npx depcruise src` con las reglas activas hasta ese paso.
- Pruebas unitarias nuevas para mappers y casos de uso de la feature migrada (con puertos falsos, sin HTTP).
- Prueba manual en el navegador, contra el backend local, de las pantallas de la feature: listar, crear, editar y los mensajes de error.

## 5. Pasos

- [x] **Paso 0. Línea base.** Rama `refactor/hexagonal`. `quality` y `build` en verde (bundle inicial 402.72 kB, 111.65 kB transferidos) y 5/5 pruebas. Las 16 pantallas (3 públicas y 13 privadas con `prueba.admin`) cargan contra el backend local, sin errores en consola.
- [x] **Paso 1. Reglas de arquitectura.** `dependency-cruiser` 18.5 con `.dependency-cruiser.cjs` y `npm run arch`, incluido en `npm run quality`. Reglas: dominio puro, aplicación sin adaptadores, presentación sin infraestructura, infraestructura sin presentación, features solo por `index.ts`, sin ciclos y `shared` independiente. Las reglas por capa aplican a `MIGRATED_FEATURES`, que crece en cada paso. Verificadas con violaciones de prueba. La regla 7 (un tipo por archivo) se verifica con un script propio desde el paso 3.
- [x] **Paso 2. Core: configuración y HTTP.** `API_BASE_URL` y `FEATURE_FLAGS` son `InjectionToken` provistos desde `environment` en `app.config.ts`; los 12 servicios inyectan `API_BASE_URL`. `features.ts` se divide en `feature-flags.ts`, `feature-flag.ts`, `feature-flags.token.ts` e `is-feature-enabled.ts`; las rutas `gated` y la navegación reciben los flags por inyección. `api-errors` pasa a `core/http/api-error-message.ts`. Nueva regla `environment-only-in-config`. `shared/documents` queda exceptuado de `shared-is-independent` hasta el paso 13. Prueba nueva de `isRouteLive` (7 pruebas). Traducir errores HTTP a errores de aplicación en los adaptadores se hace al migrar cada feature.
- [ ] **Paso 3. Shared.** Un componente por carpeta con su `.html` (`feedback`, `page`, `dialog`…). `format.ts` se divide por tema. Validadores de formulario a `shared/forms`. Sin cambios visuales.
- [ ] **Paso 4. Piloto: `societies`.** Feature pequeña (listar, crear, editar, activar) para fijar el patrón completo: dominio, puertos, casos de uso, adaptador HTTP, DTO, mapper, facade, providers, rutas, `index.ts` y pruebas. Se revisa el resultado contigo antes de repetirlo en el resto.
- [ ] **Paso 5. `areas`.**
- [ ] **Paso 6. `auth`.** Sesión detrás de un puerto `SessionStore` (adaptador `localStorage`); `AuthenticationGateway` (login, cambio y recuperación de contraseña); `ProviderDirectory` (consulta de RUC en SAP para el registro); login, registro, recuperar, crear y cambiar contraseña, contraseña temporal; guards e interceptor en `presentation`. `User` y `Role` pasan al dominio de auth.
- [ ] **Paso 7. `menus` y layout.** Menú de la sesión (`api/navigation`), `menuGuard`, Configuración › Menús. `core/layout` se divide en `app-shell`, `header` y `sidebar`, que consumen la API pública de `auth` y `menus` (rompe el ciclo `core/auth` ↔ `core/layout`).
- [ ] **Paso 8. `roles`.**
- [ ] **Paso 9. `users`.** `users-page` (630 líneas) se divide en página, componentes (tabla, formulario en drawer, enlaces de contraseña) y facade.
- [ ] **Paso 10. `profile`.** Incluye la verificación de correo; el cambio de contraseña usa el puerto de entrada de `auth` (rompe el ciclo auth ↔ profile).
- [ ] **Paso 11. `catalog`.** Sociedades, áreas y aprobadores del usuario; deja de depender de `core/auth` (usa la API pública de auth).
- [ ] **Paso 12. `payments`.** Orden de pago y Estado de factura, con `supplier-scope` en su dominio.
- [ ] **Paso 13. `documents`.** Registro (Con OC, Sin OC, especiales), bandeja de aprobación y contabilización, con un puerto por grupo de operaciones (`DocumentQuery`, `DocumentApproval`, `DocumentAccounting`, `DocumentRegistration`, `PurchaseOrderValidator`). El lector de XML UBL pasa a `infrastructure/xml` detrás de un puerto. `register-document-page` (738 líneas) se divide en página, pasos o secciones y facade.
- [ ] **Paso 14. `workflows`, `home` y en construcción.** Workflows queda con un adaptador en memoria que implementa su puerto, listo para cambiarse por HTTP sin tocar la pantalla.
- [ ] **Paso 15. Limpieza.** Eliminar carpetas antiguas vacías, activar todas las reglas para todo `src/app` y confirmar que no quedan ciclos.
- [ ] **Paso 16. Documentación.** `docs/AGENT_CONTEXT.md` (arquitectura, «dónde va cada cosa», reglas), `CLAUDE.md` y `README.md`.

## 6. Decisiones tomadas

- **Puertos:** `interface` + `InjectionToken` en `di/<feature>.tokens.ts`, como en la guía.
- **Plantillas:** todas en `.html`. Se mantiene Tailwind, sin `.scss`.
- **Nombres:** siempre en inglés (carpetas, archivos, tipos y features); las URLs siguen en español. Se mantiene la convención de Angular 20 (`app.ts`, `app.html`).
- **Pruebas en el navegador:** se cambia la contraseña temporal de `prueba.admin` en la base local de desarrollo. La nueva clave queda en el `.env` local del backend (no versionado), en `DevTest__AdminPassword`.
- **Herramienta de reglas:** `dependency-cruiser` como dependencia de desarrollo.
