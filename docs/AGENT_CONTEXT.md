# Contexto técnico para agentes — Frontend

Guía del estado real del frontend del Portal de Proveedores. Leer antes de modificar código o conectar endpoints. El historial de cómo se llegó a esta estructura está en [`PLAN_HEXAGONAL.md`](PLAN_HEXAGONAL.md); el flujo funcional, en [`FLUJO_ACTUAL.md`](FLUJO_ACTUAL.md).

## Alcance actual

Frontend Angular 20 + Tailwind CSS 4. La interfaz sigue la **Propuesta 1** del lienzo de diseño «Portal de Proveedores» (claude.ai/artifact/LokkKhVT2i2bgXEAaHzxSL).

- **Con backend real** (`http://localhost:5080/api` en desarrollo, `/api` en producción): acceso (login JWT, registro con validación de RUC en SAP, recuperación y creación de contraseña por enlace, contraseña temporal), menú por rol, Mi perfil, todo el flujo documental (registro, aprobaciones, contabilización), Orden de pago y Estado de factura (consultas en línea a SAP) y la configuración (sociedades, áreas, usuarios, roles y menús).
- **En memoria** (detrás de un puerto, listo para cambiarse por HTTP): Workflows de aprobación. Los cambios duran mientras la pestaña esté abierta.
- No asumir que una pantalla completa tiene persistencia en SQL Server: confirmar el endpoint en el backend.

## Stack y comandos

- Angular 20 standalone, signals, `ChangeDetectionStrategy.OnPush`, control flow `@if/@for/@switch/@let`.
- Tailwind CSS 4 vía `@tailwindcss/postcss` (`.postcssrc.json`). No hay SCSS.
- Tipografía Google Sans (cargada en `src/index.html`). Íconos SVG propios en `shared/ui/icon/icons.ts`.
- Pruebas con Karma + Jasmine; reglas de arquitectura con `dependency-cruiser` y un script propio.

```bash
npm install
npm start              # http://localhost:4200 (el CORS del backend solo acepta este origen)
npm run quality        # formato + tipos + reglas de dependencias + estructura de archivos
npm run arch           # solo las reglas de dependencias (.dependency-cruiser.cjs)
npm run arch:files     # solo la estructura de archivos (scripts/check-source-layout.mjs)
npm test               # Karma; en macOS: CHROME_BIN=".../Google Chrome" npx ng test --watch=false --browsers=ChromeHeadless
npm run build          # también valida los tipos de las plantillas: correrlo siempre
```

Antes de terminar un cambio: `npm run quality`, `npm test` y `npm run build`.

## Arquitectura

Arquitectura hexagonal por feature, con SRP, ISP y DIP. Cada feature tiene su dominio, sus casos de uso detrás de puertos de entrada, sus puertos de salida con adaptadores y su presentación.

```text
src/app/
├── app.ts · app.html · app.config.ts · app.routes.ts   # composición: providers raíz y rutas
├── core/
│   ├── config/        API_BASE_URL, FEATURE_FLAGS (InjectionToken) e isFeatureEnabled
│   ├── http/          apiErrorMessage y toUserFacingError (HTTP → error con mensaje)
│   └── layout/        app-shell, header, sidebar, LayoutStateService, PageLoadingService, under-construction-page
├── shared/            sin dependencias de core ni de features
│   ├── errors/        UserFacingError y userFacingMessage
│   ├── ui/            un componente por carpeta (.ts + .html): badge, callout, dialog, drawer, select, date-range, toast…
│   └── utils/         formato de fechas, montos, texto, tamaño de archivo, búsqueda y filtro de estado
└── features/<feature>/
    ├── domain/
    │   ├── models/        entidades y tipos (un tipo por archivo)
    │   ├── rules/         reglas puras (funciones), con su .spec.ts
    │   └── errors/        errores del dominio (p. ej. DocumentRejectedError)
    ├── application/
    │   ├── models/        commands y filtros
    │   ├── ports/in/      un puerto por caso de uso (interface con execute)
    │   ├── ports/out/     puertos pequeños hacia afuera (interface)
    │   └── use-cases/     clases sin Angular que implementan ports/in y dependen solo de ports/out
    ├── infrastructure/    adaptadores que implementan ports/out, una carpeta por tecnología:
    │                      http/ (+ dto/), mappers/, memory/, xml/, session/ o la feature que consultan
    ├── presentation/
    │   ├── pages/         componentes de ruta
    │   ├── components/    piezas de la página (host `contents` para no alterar el layout)
    │   ├── facades/       estado de la pantalla (signals) y orquestación de los casos de uso
    │   ├── catalog/       textos, tonos y opciones de la interfaz
    │   └── guards/ · interceptors/ · browser/   (solo donde hacen falta)
    ├── di/                <feature>.tokens.ts (un InjectionToken por puerto) y <feature>.providers.ts
    ├── <feature>.routes.ts
    └── index.ts           API pública: lo único que otras features (y core/app) pueden importar
```

### Reglas (las verifica `npm run quality`)

`dependency-cruiser` (`.dependency-cruiser.cjs`):

1. `domain-is-pure`: el dominio no importa Angular, RxJS, `core`, `shared`, otras capas ni `environment`.
2. `application-has-no-adapters`: la aplicación no usa `HttpClient`, el router, `core`, `infrastructure`, `presentation`, `di` ni `environment` (RxJS sí, para `Observable`).
3. `presentation-uses-ports-not-adapters`: la presentación nunca importa `infrastructure`; llega a los casos de uso por los tokens de `di/`.
4. `only-interceptors-know-http`: en presentación, solo los interceptores usan `@angular/common/http`.
5. `infrastructure-does-not-know-presentation`.
6. `features-talk-through-public-api`: otra feature solo se importa por su `index.ts`. `core-uses-feature-public-api` y `app-uses-feature-public-api`: lo mismo para `core` y para `app.config.ts`/`app.routes.ts`.
7. `no-circular`: ningún ciclo en toda la app.
8. `shared-is-independent`: `shared` no importa `core` ni `features`.
9. `environment-only-in-config`: el `environment` solo se lee en `core/config` y `app.config.ts`.
10. `no-orphans`: ningún archivo sin usar.

`scripts/check-source-layout.mjs` (todo `src/app`):

- Un tipo (`class`, `interface`, `type`, `enum`) por archivo; plantillas en `.html` (nada de `template:` inline); todo archivo es un módulo (importa o exporta).
- En la raíz de cada feature solo `index.ts`, `<feature>.routes.ts` y las carpetas de las capas. Subcarpetas permitidas: `domain` (models, rules, errors), `application` (models, ports/in|out, use-cases), `presentation` (pages, components, facades, catalog, guards, interceptors, browser); `infrastructure` es libre.

Si una regla falla, no se desactiva: se mueve el código a la capa correcta.

### Inyección de dependencias

- Cada puerto es una `interface` con su `InjectionToken` en `di/<feature>.tokens.ts`.
- `di/<feature>.providers.ts` enlaza: puerto de salida → adaptador (`useClass`) y puerto de entrada → caso de uso (`useFactory: () => new XUseCase(inject(PUERTO_SALIDA))`). Los casos de uso son clases planas, sin `@Injectable`.
- Las rutas cargan los providers de su pantalla (`providers: X_PROVIDERS` en `<feature>.routes.ts`), así cada feature se instancia solo al abrirla. Algunas features separan listas por pantalla (p. ej. `APPROVALS_PROVIDERS`, `ACCOUNTING_PROVIDERS`, `REGISTRATION_PROVIDERS`).
- Cada página provee su facade (`providers: [XFacade]` en el componente). Componentes que comparten estado inyectan la misma facade.
- Lo que vive toda la sesión va en la raíz: `AUTH_PROVIDERS` y `NAVIGATION_PROVIDERS` en `app.config.ts`; `SessionFacade`, `SessionMenuFacade` y `CatalogFacade` son `providedIn: 'root'`. Los tokens del catálogo se proveen con `providedIn: 'root'` y su fábrica para que el adaptador no entre al bundle inicial (≈407 kB).

### Comunicación entre features

- Solo por el `index.ts` de la otra feature (sus rutas, facades raíz, guards, tipos y tokens públicos).
- Si una feature necesita datos de otra, define **su propio puerto de salida** y un adaptador que usa el token público de la otra: `areas` → `SocietyLookupPort` → `GET_SOCIETIES`; `roles` → `MenuLookupPort` → `GET_MENUS`.
- Inversión de dependencias entre `auth` y `menus`: auth avisa los cambios de sesión por `SESSION_LISTENERS` (multi-provider) y `app.config.ts` registra al menú como oyente; auth no conoce al menú.
- `profile`, `payments` y `documents` usan `SessionFacade` (auth) y `CatalogFacade` (catalog) desde sus facades.

### Errores

- Los adaptadores traducen los errores HTTP con `toUserFacingError` (`core/http`): si el backend envió `message` (o no hubo conexión), el error es un `UserFacingError` con ese texto.
- Las facades muestran `userFacingMessage(error, 'texto genérico de la pantalla')`.
- Cuando la pantalla debe distinguir un caso, el adaptador lanza un error del dominio: `DocumentRejectedError` (422 al registrar: SAP, SUNAT o duplicidad) y `ProviderLookupError` (registro de proveedor). La validación de una orden que SAP no reconoce (422) devuelve `null`.

## Dónde va cada cosa

| Necesito… | Va en… |
|---|---|
| Una entidad o tipo del negocio | `features/<f>/domain/models/<nombre>.ts` (uno por archivo) |
| Una validación o cálculo del negocio | `features/<f>/domain/rules/<tema>-rules.ts` + `.spec.ts` |
| Un filtro o command que recibe un caso de uso | `features/<f>/application/models/` |
| Una operación nueva (listar, guardar, aprobar…) | `ports/in/<accion>.port.ts` + `use-cases/<accion>.use-case.ts` + token en `di/` + provider |
| Hablar con la API | `ports/out/<x>.port.ts` + `infrastructure/http/<x>-http.adapter.ts` + `dto/` + `mappers/` |
| Datos de otra feature | Puerto de salida propio + adaptador que usa el token público de esa feature |
| `localStorage`, XML, memoria u otra tecnología | Un adaptador en `infrastructure/<tecnologia>/` |
| Estado y acciones de una pantalla | `presentation/facades/<pantalla>.facade.ts` (signals) |
| Una ruta nueva | `presentation/pages/` + `<feature>.routes.ts` + montarla en `app.routes.ts` con `loadChildren: gatedRoutes(flag, …)` |
| Textos, tonos u opciones de la interfaz | `presentation/catalog/` |
| Un componente usado por varias features | `shared/ui/<componente>/` (no puede importar core ni features) |
| Un formateador genérico | `shared/utils/` |
| Algo del armado de la app (shell, configuración) | `core/` |

### Receta: conectar Workflows (o cualquier mock) a la API

1. Crear `infrastructure/http/workflow-http.adapter.ts` que implemente `WorkflowRepositoryPort`, con sus `dto/` y un mapper; traducir errores con `toUserFacingError`.
2. En `di/workflows.providers.ts` cambiar `{ provide: WORKFLOW_REPOSITORY, useExisting: InMemoryWorkflowAdapter }` por `useClass: WorkflowHttpAdapter`.
3. La pantalla, las facades y los casos de uso no cambian. Agregar pruebas del mapper y ejecutar `quality`, `test` y `build`.

## Features

| Feature | Pantallas (URL) | API | API pública (`index.ts`) |
|---|---|---|---|
| `auth` | `/login`, `/registro`, `/recuperar-contrasena`, `/crear-contrasena`, `/cambiar-contrasena`, `/contrasena-temporal` | `auth` | `SessionFacade`, guards, `authInterceptor`, `SESSION_LISTENERS`, `AUTH_PROVIDERS`, `Role`, `normalizeRole`, `roleLabel`, `passwordRules`, `AUTH_ROUTES` |
| `menus` | menú de la sesión; `/configuracion/menus` | `navigation`, `admin/menus` | `SessionMenuFacade`, `menuGuard`, `MODULES`, `isRouteLive`, `isLinkLive`, `GET_MENUS`, `NAVIGATION_PROVIDERS`, `MENUS_ROUTES` |
| `home` | `/inicio` | — | `HOME_ROUTES` |
| `profile` | `/perfil`, `/verificar-correo` | `profile` | `PROFILE_ROUTES`, `EMAIL_VERIFICATION_ROUTES` |
| `catalog` | — (sociedades, áreas y aprobadores del usuario) | `catalog` | `CatalogFacade` |
| `payments` | `/orden-pago`, `/estado-factura` | `payment-orders`, `invoices` | rutas |
| `documents` | `/documentos`, `/contabilizacion`, `/registrar-documento` | `documents`, `documents/orders/validate` | rutas |
| `societies` | `/configuracion/sociedades` | `admin/companies` | `GET_SOCIETIES`, `SOCIETIES_PROVIDERS`, rutas |
| `areas` | `/configuracion/areas` | `admin/areas` | rutas |
| `users` | `/configuracion/usuarios` | `admin/users` | rutas |
| `roles` | `/configuracion/roles` | `admin/roles` | rutas |
| `workflows` | `/configuracion/workflows` | en memoria | rutas |

Patrón de las pantallas de consulta: filtros en borrador (`draft`), búsqueda que ejecuta el caso de uso, `loading` enlazado a la barra superior con `PageLoadingService.bind`, skeletons, estado vacío y paginación de 10 filas.

## Estilos

- Tokens de color, sombras y animaciones en `src/styles.css` (`@theme`): `bg-page`, `text-ink`, `bg-primary`, `border-line`, `text-muted`, `bg-success`, `animate-in`, `animate-pop`, etc. Usar los tokens antes que hexadecimales sueltos.
- Componentes CSS en `@layer components`: `.btn` + `.btn-primary|secondary|outline|success|danger|tint|outline-danger`, `.field`, `.field-label`, `.card`, `.eyebrow`, `.skeleton`, `.row-hover`, `.bg-brand-gradient`, `.bg-nav-gradient`.
- Tonos de estado en `shared/ui/tone/` (`TONE_CLASSES`, `currencyTone`).
- No usar como clase propia un nombre que ya sea utilidad de Tailwind (por ejemplo `table-row` cambia el `display`).

## Feature flags

`environment.features` (`src/environments/`) enciende o apaga cada pantalla. Se proveen como `FEATURE_FLAGS` en `app.config.ts`. Apagada, la ruta sigue existiendo pero muestra «Esta sección está en construcción» (`gatedRoutes` en `app.routes.ts`) y el menú / Inicio la marcan («Pronto» / «En construcción»). En `environment.production.ts` todo está en `false`; en desarrollo, todo en `true`. Un flag nuevo se agrega a ambos environment (el tipo `FeatureFlags` de `core/config` se deriva de ahí) y al catálogo de pantallas (`features/menus/presentation/catalog/modules.ts`).

## Rutas y roles

| Ruta | Roles | Pantalla |
|---|---|---|
| `/login`, `/registro`, `/recuperar-contrasena` | Sin sesión | Acceso |
| `/crear-contrasena?ruc&token`, `/cambiar-contrasena?ruc&token`, `/verificar-correo?token` | Todos | Enlaces de los correos |
| `/inicio`, `/perfil` | Con sesión | Inicio y perfil |
| Resto de pantallas | Según el menú del rol | `menuGuard`: la ruta debe estar en `api/navigation` |

**Menú dinámico:** `SessionMenuFacade` carga `api/navigation` (opciones del rol, definidas en Configuración › Roles y permisos y Menús); el menú lateral, las tarjetas de Inicio y `menuGuard` salen de ahí. El catálogo `MODULES` solo guarda la tarjeta de Inicio y el flag de cada pantalla (`isRouteLive`); una opción creada en Menús sin pantalla muestra «en construcción». Una ruta que no está en el menú del rol redirige a Inicio. Al guardar roles o menús, el menú se vuelve a cargar.

- El **Administrador** entra a todas las rutas.
- La raíz (`/`) redirige a la pantalla inicial del rol. Los correos del backend enlazan a `/?ruc=…&activationToken=…` o `/?ruc=…&resetToken=…`; `rootRedirectGuard` los convierte a `/crear-contrasena` o `/cambiar-contrasena`.
- El backend devuelve nombres de rol del catálogo («Aprobador de área», «Gestor de cuentas por pagar»…). `normalizeRole()` los traduce a `Role`.
- Sesión en `localStorage` (adaptador `BrowserSessionStoreAdapter`): `portal-proveedores.session` y `web-proveedores.access-token`. Un 401 cierra la sesión.

## Reglas de negocio implementadas en el front

Las reglas viven en `domain/rules/` de cada feature (con pruebas); el backend vuelve a validar todo.

- **Con OC** (`documents`): la orden se valida en SAP (`documents/orders/validate`; hoy el backend simula los servicios 01 y 02 de SAP) antes de habilitar los archivos. Registra como *Pendiente de contabilización*.
- **Sin OC**: proveedor y usuario interno eligen área y aprobador → *Pendiente de aprobación*. Solo el usuario interno (o el administrador) puede marcar **Caja Chica**: sin aprobador → *Pendiente de contabilización* (`canRegisterPettyCash`).
- **Extras PDF**: en Con OC y Sin OC se consolidan en un solo adjunto `Anexos_{número}.pdf`.
- **Documentos especiales**: solo usuarios internos y administradores (`canRegisterSpecialDocuments`). PDF + datos manuales; la liquidación de cobranzas se valida en SUNAT y SAP, el resto solo duplicidad. Registra como *Pendiente de contabilización*.
- **CDR**: requerido salvo que la serie empiece con «E» (`isCdrRequired`).
- **XML**: `infrastructure/xml/ubl-document-parser.ts` lee UBL 2.1 (factura, boleta, notas). Si el archivo no es UBL, `ReadElectronicDocumentUseCase` usa un comprobante de ejemplo (`sample-document.ts`) y la revisión lo avisa. Si el usuario es proveedor, el RUC emisor debe ser el suyo (`issuerMismatchError`).
- **Archivos**: extensión permitida y máximo 5 MB (`attachmentError`).
- Duplicidad, validación SAP/SUNAT y permisos los decide el backend; el front muestra su `message` (422 = documento no válido, otros códigos = aviso en el formulario).
- **Aprobaciones**: aprobar exige N° de pedido o de viaje; rechazar exige motivo; reasignar exige área, aprobador y motivo (queda en el historial).
- **Contabilización**: rechazar exige motivo; observar exige motivo y correo válido (estado *Observado*). Estado *Contabilizado*: sin uso en los flujos actuales (Servicio 03 queda para una fase posterior).
- **Orden de pago y Estado de factura** (`payments`): el proveedor consulta siempre su RUC; Cuentas por pagar y el administrador lo ingresan (11 dígitos). Rango por defecto: últimos tres meses; máximo 3 años (`supplier-rules.ts`).
- **Contraseña temporal** (`auth`): los usuarios sembrados o creados por el administrador entran con una clave temporal. El login devuelve `mustChangePassword`; la sesión queda limitada a `/contrasena-temporal` (guards e interceptor ante 403 `PASSWORD_CHANGE_REQUIRED`) hasta cambiarla. La política es mínimo 8 caracteres con mayúscula, minúscula y número (`passwordRules`).

## Pruebas

- Cada `.spec.ts` va junto a su archivo. Hoy: reglas de dominio, mappers, casos de uso, facades y algunos adaptadores (`HttpTestingController` para HTTP).
- Los casos de uso se prueban con puertos falsos (objetos con `jasmine.createSpy`), sin Angular ni HTTP.
- Las facades se prueban con `TestBed` proveyendo los tokens de los puertos de entrada con `useValue`.
- En el navegador, probar contra el backend local. No ejecutar acciones que envían correos reales (aprobar, rechazar, observar, registrar, enlaces de contraseña) con datos reales.

## Pendientes

- Los listados de documentos traen hasta 100 registros y paginan en el navegador; pasar a paginación del servidor si crece el volumen.
- Workflows no tiene API todavía (ver la receta de arriba).
- Cuando SAP no tiene datos, devuelve una fila de aviso que hoy se muestra como resultado en Orden de pago y Estado de factura. Se corregirá en el backend (paso 17 del plan).
