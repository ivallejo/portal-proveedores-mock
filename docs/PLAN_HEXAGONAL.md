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
- [x] **Paso 3. Shared.** `shared/ui`: un componente por carpeta con su `.html` (`feedback` → `progress-bar`, `loading-state`, `empty-state`, `result-state`, `callout`; `page` → `page-header`, `kpi-card`, `pagination`; `confirm-dialog` en su carpeta). Tipos en su propio archivo: `SelectOption`, `DateRange`, `DateRangeLayout`, `DayCell`, `MonthView`, `ToastState`, `IconName`, `BadgeSize`, `SpinnerTone`, `ResultKind`, `CalloutTone`, `Tone`. Los helpers del calendario pasan a `date-range/calendar.util.ts`. `shared/utils/format.ts` se divide en `currency.ts`, `money-format.util.ts`, `date-format.util.ts`, `text-format.util.ts` y `file-size.util.ts`. Regla 7 con `scripts/check-source-layout.mjs` (`npm run arch:files`, en `quality`): un tipo por archivo, sin plantillas inline y ningún archivo como script global. Bundle inicial 397.11 kB (antes 403.01 kB). Revisado en el navegador: tablas, KPI, paginación, drawer y calendario.
- [x] **Paso 4. Piloto: `societies`.** Feature completa: dominio (`Society`, reglas de código, RUC y correo), aplicación (3 puertos de entrada con su caso de uso y `SocietyRepositoryPort`), infraestructura (`SocietyHttpAdapter`, DTO y mapper), presentación (`SocietyListPage`, `SocietyTable`, `SocietyFormDrawer` y `SocietyListFacade`), `di/`, `societies.routes.ts` (cargada con `loadChildren` + `gatedRoutes`) e `index.ts`. Errores: los adaptadores traducen la respuesta del backend a `UserFacingError` (`core/http/to-user-facing-error.ts`) y las pantallas usan `userFacingMessage`. `status.ts` pasa a `shared/utils`. Se corrigen las reglas de dependency-cruiser sobre paquetes npm (comparaban `^@angular` en vez de la ruta resuelta `node_modules/@angular/`). 12 pruebas nuevas (19 en total). Probado en el navegador: listado, búsqueda, validación, edición guardada y mensaje de error del backend.
- [x] **Paso 5. `areas`.** Mismo patrón que `societies`: 4 puertos de entrada (listar, sociedades del selector, guardar, cambiar estado), `AreaRepositoryPort` con `AreaHttpAdapter`, facade y componentes. En el frontend se usan los nombres del dominio (`societyId`, `societyName`); el mapper los traduce a los campos de la API (`companyId`, `companyName`). Las sociedades llegan por el puerto de salida `SocietyLookupPort`, cuyo adaptador usa `GET_SOCIETIES` de la API pública de `societies` (que ahora exporta el puerto y sus providers). Se elimina `features/settings/organization`. 5 pruebas nuevas (24 en total). Probado en el navegador: listado, filtro de sociedades, edición y guardado.
- [x] **Paso 6. `auth`.** `core/auth`, `features/auth`, `features/providers` y `shared/models` se juntan en `features/auth`. Dominio: `AuthenticatedUser`, `Role`, reglas de rol (`normalizeRole`, `roleLabel`, `hasAnyRole`, `landingPathFor`) y de contraseña (antes duplicadas en dos páginas), y `ProviderLookupError`. 10 puertos de entrada con su caso de uso y 4 de salida: `AuthenticationGatewayPort`, `SessionStorePort` (`localStorage`, mismas claves), `ProviderDirectoryPort` y `SessionListenerPort`. `SessionFacade` (raíz) reemplaza a `AuthService`. Los guards (uno por archivo) y el interceptor pasan a `presentation`; el interceptor lee el token por `GET_ACCESS_TOKEN`. Inversión de dependencias: auth ya no llama al menú; el menú se registra como `SESSION_LISTENERS` en `app.config.ts`. Los adaptadores absorben los códigos HTTP (404 de recuperación como envío genérico; 409/400/0/5xx del registro como `ProviderLookupError`). `menuGuard` pasa a `core/layout/menu.guard.ts` y la verificación de correo a `features/profile`. Nueva regla `only-interceptors-know-http`. 13 pruebas nuevas (37). Probado en el navegador: sesión restaurada, guards, cierre de sesión, login con clave incorrecta, 401, registro, recuperación y enlace inválido.
- [x] **Paso 7. `menus` y layout.** Feature `menus`: menú de la sesión (`SessionMenuFacade` en lugar de `MenuService`, con `GetNavigationPort` y `NavigationHttpAdapter`), `menuGuard`, catálogo de pantallas (antes `core/layout/navigation.ts`) y Configuración › Menús (4 puertos de entrada; `SaveMenuUseCase` aplica el estado después de guardar, lógica que antes estaba en la pantalla). Reglas del dominio: rutas del menú, opciones protegidas, formato de ruta y orden. `core/layout/shell` se divide en `app-shell`, `header` y `sidebar` (host `contents`, para no cambiar el sticky), con `LayoutStateService` para el estado compartido. El menú se registra como `SESSION_LISTENERS`; `NAVIGATION_PROVIDERS` en `app.config.ts`. Nueva regla `core-uses-feature-public-api`. 8 pruebas nuevas (45). Probado en el navegador: escritorio (sticky al hacer scroll, grupo desplegado), móvil (abrir y cerrar al navegar), Inicio y edición de una opción del sistema.
- [x] **Paso 8. `roles`.** Configuración › Roles y permisos pasa a `features/roles` (`AccessRole`, para no chocar con `Role` de auth). La lógica del árbol de permisos (un menú principal arrastra sus submenús y viceversa, estado mixto) y la validación del nombre pasan del componente al dominio (`permission-rules.ts`). `SaveRoleUseCase` aplica el estado después de guardar. Las opciones del menú llegan por `MenuLookupPort`, cuyo adaptador usa `GET_MENUS` de la API pública de `menus`. Se elimina `features/settings/access` (y `AccessService`). 6 pruebas nuevas (51). Probado en el navegador: listado, árbol de permisos (estado mixto) y guardado.
- [x] **Paso 9. `users`.** `users-page` (630 líneas y 775 de plantilla) y `users.service` (9 tipos) pasan a `features/users`: 15 modelos de dominio, reglas (`user-rules.ts`: RUC, DNI, nombres, área de una sociedad asignada, correos nuevos y principal), 7 puertos de entrada y 3 de salida segregados (`UserRepositoryPort`, `UserCatalogQueryPort`, `PasswordLinkGatewayPort`). Dos facades: `UserListFacade` (listado paginado, catálogo, activación) y `UserEditorFacade` (alta y edición). La plantilla se divide en página, tabla, drawer y un componente por pestaña (Datos, Correos, Sociedades, Seguridad). Se elimina la dependencia de `profile` (tipo de correo propio) y `stamp` pasa a `shared/utils` como `formatDateTime`. `features/settings` desaparece. 7 pruebas nuevas (58). Probado en el navegador: listado, 4 pestañas, edición guardada, validación de un alta y diálogo de estado.
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
