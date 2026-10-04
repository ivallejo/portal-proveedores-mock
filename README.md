# Portal de Proveedores · Frontend

Frontend Angular del Portal de Proveedores de Naviera Transoceánica S.A. Incluye autenticación, registro de proveedores, gestión documental y administración de usuarios.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Instalación y arranque

```bash
npm install
npm start
```

Abrir [http://localhost:4200](http://localhost:4200).

El prototipo puede ejecutarse sin backend para explorar la UI, pero los flujos de login, registro online y recuperación de contraseña consumen la API cuando está disponible. Los módulos documentales y operativos mantienen mocks locales.

> Estado actualizado: login, registro online y recuperación de contraseña ya tienen integración parcial con el backend. Los módulos documentales, aprobaciones, contabilización, workflows y administración todavía utilizan mocks locales. Consulta [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) antes de continuar el desarrollo.

## Flujo del prototipo

1. Ejecutar `npm install`.
2. Ejecutar `npm start`.
3. Abrir `http://localhost:4200`.
4. Probar los roles y flujos mock desde el login.

Credenciales locales del administrador:

```text
Usuario administrador: `admin`
Contraseña: `AdminLocal_12345!`

Usuarios mock adicionales:

- Proveedor: `20123456789` / `1234`
- Colaborador interno: `colaborador` / `1234`
- Área Usuaria: `maria.torres` / `1234`
- CxP: `cxp` / `1234`
```

## Comandos útiles

```bash
npm start             # Servidor de desarrollo
npm run build         # Compilación de producción
npm run format        # Formatear TypeScript, HTML y SCSS
npm run format:check  # Verificar formato
npm test              # Ejecutar pruebas
```

## Configuración de producción

El prototipo no requiere enrutar `/api` ni levantar servicios adicionales para publicarse.

## Estructura principal

```text
src/app/
├── core/                       # Auth, shell, navegación y estado global
├── features/                   # Pantallas y servicios por módulo
├── shared/                     # Modelos y stores mock
└── styles/                     # Tokens y estilos globales
```

## Documentación para agentes

La guía completa de arquitectura, límites entre mock/backend, credenciales, flujos y próximos pasos está en [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md).
