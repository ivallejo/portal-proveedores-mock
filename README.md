# Portal de Proveedores · Frontend

Frontend Angular 20 + Tailwind CSS 4 del Portal de Proveedores de Naviera Transoceánica S.A. Implementa la Propuesta 1 del diseño: autenticación, registro de proveedores, consultas, registro de documentos, aprobaciones, contabilización y administración.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Instalación y arranque

```bash
npm install
npm start
```

Abrir [http://localhost:4200](http://localhost:4200).

> Consulta [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md) antes de continuar el desarrollo: describe rutas, roles, componentes compartidos y qué partes siguen en mock.

## Acceso

Login, registro online y recuperación de contraseña usan el backend (`http://localhost:5080/api`). Levanta la API antes de iniciar sesión; el administrador inicial se configura en el `.env` del backend.

Los módulos de documentos, órdenes, aprobaciones y contabilización usan servicios mock con datos de prueba guardados en `localStorage`.

## Comandos útiles

```bash
npm start             # Servidor de desarrollo
npm run build         # Compilación de producción
npm run format        # Formatear TypeScript, HTML y CSS
npm run format:check  # Verificar formato
npm test              # Ejecutar pruebas
```

## Configuración de producción

En producción la aplicación llama a `/api` (ver `src/environments/environment.production.ts`); el servidor que la publique debe enrutar esa ruta al backend.

## Estructura principal

```text
src/app/
├── core/                       # Auth, guards, layout y menú por rol
├── features/                   # Pantallas y servicios por módulo
└── shared/                     # Componentes UI, documentos, catálogos y utilidades
src/styles.css                  # Tailwind y tokens de diseño (@theme)
```

## Documentación para agentes

La guía completa de arquitectura, límites entre mock/backend, credenciales, flujos y próximos pasos está en [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md).
