# Contexto técnico para agentes — Frontend

Guía del estado real del frontend del Portal de Proveedores. Leer antes de modificar código o conectar endpoints.

## Alcance actual

Frontend Angular 20 + Tailwind CSS 4. La interfaz sigue la **Propuesta 1** del lienzo de diseño «Portal de Proveedores» (claude.ai/artifact/LokkKhVT2i2bgXEAaHzxSL).

- **Con backend real**: login (JWT), registro online (validación de RUC en SAP y envío del enlace), recuperación de contraseña, creación y cambio de contraseña por enlace, y **todo el flujo documental**: Registrar documentos, Documentos (aprobaciones) y Contabilización (`api/documents`, `api/catalog`), **Usuarios y roles** (`api/admin/users`), y **Orden de pago** y **Estado de factura** (`api/payment-orders`, `api/invoices`: consultas en línea a SAP; el proveedor ve su RUC, CxP y el administrador ingresan el RUC).
- **Con servicios mock** (misma forma que tendrá la API, respuestas con `delay`): Workflows y correos del perfil.
- No asumir que una pantalla completa tiene persistencia en SQL Server.

## Feature flags

`environment.features` (`src/environments/`) enciende o apaga cada pantalla. Apagada, la ruta sigue existiendo pero muestra «Esta sección está en construcción» y el menú / Inicio la marcan («Pronto» / «En construcción»). En `environment.production.ts` todo está en `false` salvo Inicio; en desarrollo todo está en `true`. Para publicar una pantalla, ponerla en `true` en producción. Las rutas se protegen con `gated(flag, loader)` en `app.routes.ts`; un flag nuevo se agrega a ambos environment y a `navigation.ts`.

## Stack y comandos

- Angular 20 standalone, signals, `ChangeDetectionStrategy.OnPush`, control flow `@if/@for/@switch`.
- Tailwind CSS 4 vía `@tailwindcss/postcss` (`.postcssrc.json`). No hay SCSS.
- Tipografía Google Sans (cargada en `src/index.html`).
- Íconos SVG propios en `shared/ui/icon/icons.ts` (no se usa Boxicons ni SweetAlert2).

```bash
npm install
npm start            # http://localhost:4200
npm run build
npm run typecheck
npm run format:check
npm test             # Karma; en macOS: CHROME_BIN=".../Google Chrome" npx ng test --watch=false --browsers=ChromeHeadless
```

## Estilos

- Tokens de color, sombras y animaciones en `src/styles.css` (`@theme`): `bg-page`, `text-ink`, `bg-primary`, `border-line`, `text-muted`, `bg-success`, `animate-in`, `animate-pop`, etc. Usar los tokens antes que hexadecimales sueltos.
- Componentes CSS reutilizables en `@layer components`: `.btn` + `.btn-primary|secondary|outline|success|danger|tint|outline-danger`, `.field`, `.field-label`, `.card`, `.eyebrow`, `.skeleton`, `.row-hover`, `.bg-brand-gradient`, `.bg-nav-gradient`.
- Tonos de estado (fondo/texto/punto) en `shared/ui/tone.ts` (`TONE_CLASSES`).
- No usar como clase propia un nombre que ya sea utilidad de Tailwind (por ejemplo `table-row` cambia el `display`).

## Arquitectura

```text
src/app/
├── app.routes.ts              # Rutas con lazy loading y guards
├── core/
│   ├── auth/                  # AuthService, interceptor JWT, guards (auth, guest, role, rootRedirect)
│   └── layout/                # ShellComponent (menú lateral + encabezado), MODULES/SETTINGS_LINKS, PageLoadingService
├── shared/
│   ├── ui/                    # icon, badge, select, dialog, toast, feedback (callout, empty, result, loading, progress), page (header, kpi, pagination), spinner, tone
│   ├── documents/             # Modelo PortalDocument, DocumentsService (HTTP), mapper backend→UI, historial
│   ├── data/catalog.service.ts # Sociedades, áreas y aprobadores desde api/catalog
│   ├── data/supplier-scope.ts # RUC propio vs. RUC ingresado y rango de fechas de las consultas a SAP
│   ├── models/models.ts       # Role, roleLabel, normalizeRole, User
│   ├── state/mock-users.store # Usuarios mock (Perfil, Workflows)
│   └── utils/format.ts        # money, formatDate, maskEmail, initials…
└── features/
    ├── auth/                  # login, registro, recuperar contraseña, crear/cambiar contraseña
    ├── home/                  # Inicio con tarjetas por rol
    ├── payment-orders/        # Orden de pago
    ├── invoice-status/        # Estado de factura
    ├── approvals/             # Documentos (aprobar, rechazar, reasignar)
    ├── register-document/     # Registro Con OC, Sin OC y Documentos especiales; lector de XML UBL
    ├── accounting/            # Contabilización (rechazar, observar)
    ├── administration/users/  # Usuarios y roles (api/admin/users: multirol, área, sociedades, desbloqueo)
    ├── workflows/             # Workflows de aprobación
    ├── profile/               # Mi perfil
    └── settings/              # Pantallas «Próximamente» de Configuración
```

Cada página es un componente de ruta. Patrón de las pantallas de consulta: filtros en borrador (`draft`), búsqueda que llama al servicio, `loading` enlazado a la barra superior con `PageLoadingService.bind`, skeletons, estado vacío y paginación de 10 filas.

## Rutas y roles

| Ruta | Roles | Pantalla |
|---|---|---|
| `/login`, `/registro`, `/recuperar-contrasena` | Sin sesión | Acceso |
| `/crear-contrasena?ruc&token`, `/cambiar-contrasena?ruc&token` | Todos | Contraseña por enlace |
| `/inicio`, `/perfil` | Con sesión | Inicio y perfil |
| `/orden-pago`, `/estado-factura` | Proveedor | Consultas |
| `/documentos` | Área Usuaria | Aprobaciones |
| `/registrar-documento` | Proveedor, Colaborador interno | Registro |
| `/contabilizacion` | CxP | Contabilización |
| `/configuracion/*` | Administrador | Configuración |

- El **Administrador** entra a todas las rutas.
- La raíz (`/`) redirige a la pantalla inicial del rol. Los correos del backend enlazan a `/?ruc=…&activationToken=…` o `/?ruc=…&resetToken=…`; `rootRedirectGuard` los convierte a `/crear-contrasena` o `/cambiar-contrasena`.
- El backend devuelve nombres de rol del catálogo («Aprobador de área», «Gestor de cuentas por pagar»…). `normalizeRole()` los traduce a `Role`.
- Sesión en `localStorage`: `portal-proveedores.session` y `web-proveedores.access-token`. Un 401 cierra la sesión.

## Reglas de negocio implementadas en el front

- **Con OC**: valida la orden (Servicio 01 simulado: `4500012873`, `4500012851` servicio; `CR-2026-00418` bien) antes de habilitar archivos. Registra como *Pendiente de contabilización*.
- **Sin OC**: proveedor y usuario interno eligen área y aprobador → *Pendiente de aprobación*. Solo el usuario interno (o admin) puede marcar **Caja Chica**: sin aprobador → *Pendiente de contabilización*.
- **Extras PDF**: en Con OC y Sin OC se consolidan en un solo adjunto `Anexos_{número}.pdf`.
- **Reasignar** exige motivo (queda en el historial).
- **Documentos especiales**: solo usuarios internos y administradores. PDF + datos manuales; la liquidación de cobranzas se valida en SUNAT y SAP, el resto solo duplicidad. Registra como *Pendiente de contabilización*.
- **CDR**: requerido salvo que la serie del XML empiece con «E».
- **XML**: `xml-reader.ts` lee UBL 2.1 (factura, boleta, notas). Si el archivo no es UBL se usan datos de ejemplo y se avisa en la revisión. Si el usuario es proveedor, el RUC emisor debe ser el suyo.
- Archivos: extensión permitida y máximo 5 MB; los extras PDF se consolidan en Sin OC.
- Duplicidad, validación SAP/SUNAT y permisos los decide el backend; el front muestra su `message` (422 = documento no válido, otros códigos = aviso en el formulario).
- Aprobar exige N° de pedido o de viaje; rechazar exige motivo; reasignar exige área y aprobador.
- **Contraseña temporal:** los usuarios sembrados o creados por el administrador entran con una clave temporal. El login devuelve `mustChangePassword`; la sesión queda limitada a `/contrasena-temporal` (guards e interceptor ante 403 `PASSWORD_CHANGE_REQUIRED`) hasta cambiarla con `POST /auth/change-password`. La política es mínimo 8 caracteres con mayúscula, minúscula y número.
- Estado *Contabilizado*: sin uso en los flujos actuales (Servicio 03 queda para una fase posterior).
- Contabilización: rechazar exige motivo; observar exige motivo y correo válido (estado *Observado*).

## Cómo conectar un módulo al backend

1. Mantener la interfaz pública del servicio mock (`search`, `detail`, `approve`…) y reemplazar el cuerpo por `HttpClient`.
2. Mover los tipos a contratos compartidos con el backend cuando existan los DTO.
3. Mantener los estados de carga, vacío, error y éxito de la pantalla.
4. No guardar secretos en `environment`.
5. Ejecutar `npm run quality`, `npm test` y `npm run build`.

## Pendientes

- Endpoints de órdenes de pago y estado de factura en el backend.
- Endpoints de administración multirol y perfil (hoy en `MockUsersStore`).
- Pantallas de Configuración: Sociedad, Área, Centro de costo, Parámetros generales.
- Los listados traen hasta 100 documentos y paginan en el navegador; pasar a paginación del servidor si crece el volumen.
