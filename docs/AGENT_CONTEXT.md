# Contexto técnico para agentes — Frontend

Guía del estado real del frontend del Portal de Proveedores. Debe leerse antes de modificar código o conectar nuevos endpoints.

## Alcance actual

Frontend Angular 20 para Naviera Transoceánica. Es un prototipo navegable con integración parcial:

- Login, sesión, registro online y recuperación/cambio de contraseña consumen el backend.
- Documentos, aprobaciones, contabilización, usuarios administrativos, workflows y parte del perfil todavía usan mocks, signals y `localStorage`.
- No asumir que una pantalla completa visualmente ya tiene persistencia en SQL Server.

## Stack y comandos

- Angular 20, TypeScript 5.9, RxJS.
- Standalone components; no se usa `NgModule`.
- SCSS propio, tokens en `src/styles/tokens.scss`.
- Boxicons locales y SweetAlert2.
- Node.js 20+ y npm 10+.

```bash
npm install
npm start
```

Frontend: `http://localhost:4200`.

```bash
npm run build
npm run typecheck
npm run format:check
npm run quality
npm test
```

## Configuración y backend

La URL está en `src/environments/environment.ts`:

```ts
apiBaseUrl: 'http://localhost:5080/api'
```

No colocar secretos en archivos de environment. El interceptor agrega el JWT almacenado en `web-proveedores.access-token`.

## Arquitectura de carpetas

```text
src/app/
├── core/
│   ├── auth/              # Sesión, login e interceptor
│   ├── layout/            # Shell, navbar y sidebar
│   ├── navigation/        # Estado de pantalla del prototipo
│   └── state/             # PortalFacade
├── features/
│   ├── auth/              # Login, registro y recuperación
│   ├── dashboard/         # Inicio
│   ├── documents/         # Registrar documento y Mis documentos
│   ├── administration/   # Usuarios y roles
│   ├── approvals/         # Aprobaciones mock
│   ├── accounting/        # Contabilización mock
│   ├── workflows/         # Workflows mock/prototipo
│   ├── profile/           # Perfil
│   └── providers/         # Consulta de proveedor vía API
├── shared/
│   ├── models/            # Tipos del frontend
│   └── state/             # MockUsersStore y MockDataService
└── styles/                # Tokens y estilos globales
```

## Entrada y navegación

`app.ts` y `app.html` componen la aplicación. `app.routes.ts` está vacío: las pantallas internas no usan router, sino la signal `screen` de `NavigationService` y `PortalFacade`.

Pantallas disponibles:

```text
dashboard, registrar, documentos, perfil, usuarios,
workflows, aprobaciones, contabilizacion
```

El shell se muestra cuando `AuthService.user()` tiene sesión; de lo contrario se muestra `LoginComponent`.

Landing por rol:

- `Proveedor`: inicio.
- `Colaborador interno`: Registrar documento.
- `Área Usuaria`: Aprobaciones.
- `CxP`: Contabilización.
- `Administrador`: inicio, administración y workflows.

## Roles y sesión

Los tipos están en `src/app/shared/models/models.ts`. `roleLabel()` transforma los nombres técnicos:

| Código | Nombre visible |
|---|---|
| `Proveedor` | Proveedor externo |
| `Colaborador interno` | Usuario interno |
| `Área Usuaria` | Aprobador de área |
| `CxP` | Gestor de cuentas por pagar |
| `Administrador` | Administrador del portal |

Un usuario puede tener varios roles. `AuthService.setActiveRole()` cambia el rol activo sin modificar la lista de roles.

Claves de `localStorage`:

```text
portal-proveedores.mock-session
portal-proveedores.mock-users
web-proveedores.access-token
```

`AuthService.login()` llama `POST /api/auth/login`, guarda JWT y sesión local. `AuthService.register()` aún crea directamente en `MockUsersStore`; el Registro Online visual usa `SapProviderService` y los endpoints reales `validate-ruc` y `request-access-key`.

Los links con `activationToken`, `resetToken` y `ruc` fuerzan la pantalla de autenticación/cambio de contraseña.

## Credenciales del prototipo

`MockUsersStore` normaliza las credenciales demo a `123456` al iniciar:

```text
admin / 123456             Administrador
20123456789 / 123456       Proveedor
colaborador / 123456       Usuario interno
maria.torres / 123456     Aprobador de área
cxp / 123456               Gestor de cuentas por pagar
```

También genera un pool de 25 usuarios mock para áreas y aprobadores.

## Flujos

### Registro Online

1. Se ingresa RUC.
2. `SapProviderService.lookupByRuc()` llama `POST /api/auth/validate-ruc`.
3. El backend valida duplicidad y consulta SAP.
4. Se muestran razón social y correo ofuscado.
5. Se aceptan términos.
6. `requestAccessKey()` llama `POST /api/auth/request-access-key`.
7. El backend prepara el proveedor y envía un correo de activación.

### Recuperación

- Solicitud: `POST /api/auth/password-reset/request`.
- Confirmación: `POST /api/auth/password-reset/confirm`.
- Activación inicial: `POST /api/auth/activation/confirm`.

### Módulos aún mock

La UI de documentos soporta OC, sin OC, documento especial, XML/PDF/CDR/sustentos, validación simulada, alertas, historial y detalle. Persistencia local.

Usuarios, workflows, aprobaciones y contabilización también usan stores/services mock. No hay endpoints backend equivalentes todavía.

## Reglas visuales

- Tipografía: Outfit.
- Primario: `#253C6D`.
- Acento: `#ED7624`.
- No reintroducir `#41699D`, `#557BB1` ni `#7283A2`.
- El estilo nuevo de login/home es el vigente; no reutilizar legacy para nuevas pantallas.
- El shell tiene sidebar colapsable y scroll en el contenido.
- En móvil se oculta la imagen lateral del login.

## Cómo conectar un módulo nuevo

1. Mantener componentes de página delgados.
2. Crear un service HTTP por feature.
3. Definir DTOs/interfaces en `shared/models` o dentro del feature.
4. Mover coordinación y estado a una facade.
5. Sustituir `MockDataService`/`MockUsersStore` solo cuando exista el endpoint equivalente.
6. Mantener estados loading, vacío, error y éxito.
7. No guardar secretos en frontend.
8. Ejecutar `npm run quality` y `npm run build`.

## Pendientes

- Migrar documentos, archivos, historial, aprobaciones y contabilización a API/SQL.
- Conectar administración de usuarios y múltiples roles al backend.
- Implementar guards/routing real si se abandona la navegación por signals.
- Retirar definitivamente código legacy no utilizado.
- Agregar pruebas unitarias de servicios y componentes críticos.

