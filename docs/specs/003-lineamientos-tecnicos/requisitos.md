# Spec 003 · Lineamientos técnicos · Requisitos

| Campo | Valor |
|---|---|
| Estado | **Borrador** |
| Fecha | 2026-10-20 |
| Origen | Lineamientos Técnicos - Web de Proveedores (`LIN-WEB-PROV-001`, rev. 1.0, 24/09/2026), emitidos por TI de Naviera Transoceánica |
| Repos | Frontend y backend (nuestros y, después, los del cliente) |

## Contexto

TI definió el stack base, los ambientes, la gestión del código, el CI/CD y la calidad mínima del proyecto. Se revisaron los cuatro repos (`portal-proveedores-mock`, `portal-proveedores-backend` y los del cliente en `feature/seguridad`), que comparten la misma base.

**Ya se cumple:** .NET 10 / ASP.NET Core Web API, EF Core 10, SQL Server; capas separadas e inyección de dependencias; JWT con autorización en backend; manejo global de errores (`ProblemDetails`); Swagger/OpenAPI; `/health` con la base; migraciones versionadas (aplicación automática apagada por defecto); validación de tamaño, extensión y contenido de archivos; secretos fuera del repo; pruebas automatizadas; front organizado por funcionalidad, con autenticación y HTTP centralizados, manejo de 401/403 y roles solo visuales; Node 24.

Esta spec cubre lo que falta.

## Requisitos

### R1 · Angular 22 y TypeScript 6
- [ ] Los fronts usan Angular 22 y TypeScript 6.x, con dependencias compatibles (Tailwind 4, dependency-cruiser, pruebas).
- [ ] `package.json` declara `engines.node` `>=24`.
- [ ] `npm run quality`, las pruebas y el build de producción pasan sin advertencias nuevas.

### R2 · Ambientes Desarrollo, QAS y Producción
- [ ] Backend: `appsettings.QAS.json` (sin secretos) y `ASPNETCORE_ENVIRONMENT=QAS` reconocido; QAS se comporta como Producción en lo sensible (correo real o redirigido según configuración, sin mocks, sin Swagger salvo que TI lo pida).
- [ ] Frontend: la URL de la API y las funcionalidades activas se leen al arrancar desde `config.json` (junto al `index.html`), de modo que **un mismo build** sirve para QAS y Producción; TI solo cambia ese archivo.
- [ ] Si `config.json` falta o es inválido, la aplicación muestra un error claro en lugar de quedar en blanco.

### R3 · Publicación en IIS
- [ ] El build del front incluye un `web.config` con reescritura de rutas internas hacia `index.html` (requiere el módulo URL Rewrite) y sin caché para `index.html` y `config.json`.
- [ ] El backend se publica con `dotnet publish -c Release` y queda documentado el hosting en IIS (ASP.NET Core Hosting Bundle, variables de entorno del pool).

### R4 · Sin mocks ni credenciales de prueba en QAS/Producción
- [ ] `Sap:DocumentServices=Simulated` no se permite fuera de Desarrollo: la API no arranca. Se quita la excepción actual en Producción.
- [ ] El seed de QAS/Producción no contiene usuarios de prueba; `seed.development.json` solo se usa en Desarrollo y la API lo rechaza fuera de él.
- [ ] El modo de correo `Redirect` no se permite en Producción (ya es así; se verifica y se cubre con prueba).

### R5 · Base de datos sin permisos administrativos permanentes
- [ ] Cada versión entrega un script SQL idempotente (`dotnet ef migrations script --idempotent`) generado por un comando documentado, para que TI lo ejecute.
- [ ] La aplicación funciona con un usuario de base con permisos de lectura y escritura (sin DDL) cuando `Database:ApplyMigrationsOnStartup=false`.
- [ ] Se documentan los cambios de esquema de cada versión.

### R6 · Health check de dependencias
- [ ] `/health` revisa SQL Server y Blob Storage, sin exponer detalles internos (solo `Healthy`/`Unhealthy` por dependencia).

### R7 · Logs sin secretos
- [ ] Se auditan los logs: ninguno escribe contraseñas, tokens, OTP, cadenas de conexión ni la clave de Blob. Se agrega una prueba para el log de arranque.

### R8 · README según la sección 10
- [ ] Cada README incluye: stack y versiones; ejecución local; comandos de instalación, build, test y publish con la carpeta del artefacto; variables por ambiente (sin valores); integraciones (SAP, SUNAT, SMTP, Blob) con su finalidad y requisitos de red; estructura; consideraciones de despliegue en IIS.

### R9 · Entregable técnico inicial (sección 12)
- [ ] Documento `docs/ENTREGABLE_TECNICO.md` (front) con versiones, arquitectura, librerías con su justificación, autenticación y autorización, acceso a datos, configuración por ambiente, integraciones y comandos de build/publish.

## Decisiones

| ID | Pregunta | Quién decide | Decisión |
|---|---|---|---|
| D1 | Flujo de ramas: el documento dice `master → feature/fix → PR → QAS`; los repos del cliente tienen `development`, `review` y `production`, sin `master`. ¿Cuál vale? | TI | _pendiente_ |
| D2 | El documento nombra `web-proveedores-frontend`; el repo real es `web-proveedores-fronted`. ¿Se renombra? | TI | _pendiente_ |
| D3 | ¿Configuración del front en tiempo de ejecución (`config.json`) o un build por ambiente (`environment.qas.ts`)? Propuesta: `config.json`. | Usuario | _pendiente_ |
| D4 | ¿`/health` también revisa SAP (requiere VPN y puede dar falsos negativos)? Propuesta: no; solo SQL y Blob. | Usuario / TI | _pendiente_ |
| D5 | ¿Nuestros repos también pasan a ramas y PR, o siguen con push a `main`? | Usuario | _pendiente_ |
| D6 | Orden: primero nuestros repos y luego los del cliente en una rama `feature/lineamientos`. | Usuario | _pendiente_ |

## Fuera de alcance

- Workflows de GitHub Actions, runner, IIS y secretos de QAS/Producción: los administra TI.
- Implementación real de los servicios SAP 01 y 02 (depende de SAP; R4 solo impide usar el simulado fuera de Desarrollo).
- Cambios funcionales del portal.
