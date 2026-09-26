# Portal de Proveedores · Frontend

Frontend Angular del Portal de Proveedores de Naviera Transoceánica S.A. Incluye autenticación, registro de proveedores, gestión documental y administración de usuarios.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.
- Backend ejecutándose en `http://localhost:5080` para autenticación y administración.

## Instalación y arranque

```bash
npm install
npm start
```

Abrir [http://localhost:4200](http://localhost:4200).

El frontend utiliza por defecto `http://localhost:5080/api`. Para cambiarla, editar `src/environments/environment.ts`.

## Flujo recomendado con backend

1. Levantar SQL Server y la API siguiendo el README del repositorio backend.
2. Ejecutar `npm install` en este repositorio.
3. Ejecutar `npm start`.
4. Ingresar con el administrador inicial o registrar un proveedor nuevo.

Credenciales locales del administrador:

```text
Correo: admin@naviera.local
Contraseña: valor de `BootstrapAdmin__Password` en el `.env` del backend
```

La contraseña se define en el `.env` del backend.

## Comandos útiles

```bash
npm start             # Servidor de desarrollo
npm run build         # Compilación de producción
npm run format        # Formatear TypeScript, HTML y SCSS
npm run format:check  # Verificar formato
npm test              # Ejecutar pruebas
```

## Configuración de producción

La configuración de producción usa una API relativa (`/api`) desde `src/environments/environment.production.ts`. El servidor web debe enrutar `/api` hacia el backend.

## Estructura principal

```text
src/app/
├── auth.service.ts             # Autenticación y sesión
├── auth.interceptor.ts         # Token Bearer
├── admin-users.component.*     # Usuarios, roles y paginación
├── admin.service.ts            # Cliente HTTP de administración
├── documento.service.ts        # Flujo documental
├── aprobacion.service.ts       # Aprobaciones
└── contabilizacion.service.ts  # Contabilización
```
