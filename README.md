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

Actualmente el prototipo funciona de forma independiente, sin backend. La autenticación, el registro online, la administración de usuarios, la validación de RUC y los flujos documentales utilizan mocks locales y `localStorage`.

## Flujo del prototipo

1. Ejecutar `npm install`.
2. Ejecutar `npm start`.
3. Abrir `http://localhost:4200`.
4. Probar los roles y flujos mock desde el login.

Credenciales locales del administrador:

```text
Usuario administrador: `admin@naviera.local`
Contraseña: `AdminLocal_12345!`

Usuarios mock adicionales:

- Proveedor: `proveedor@naviera.local` / `1234`
- Colaborador interno: `colaborador@naviera.local` / `1234`
- Área Usuaria: `aprobador@naviera.local` / `1234`
- CxP: `cxp@naviera.local` / `1234`
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
├── auth.service.ts             # Autenticación y sesión
├── auth.interceptor.ts         # Token Bearer
├── admin-users.component.*     # Usuarios, roles y paginación
├── admin.service.ts            # Cliente HTTP de administración
├── documento.service.ts        # Flujo documental
├── aprobacion.service.ts       # Aprobaciones
└── contabilizacion.service.ts  # Contabilización
```
