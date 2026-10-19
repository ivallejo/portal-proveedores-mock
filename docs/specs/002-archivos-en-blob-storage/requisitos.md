# Spec 002 · Archivos en Blob Storage · Requisitos

| Campo | Valor |
|---|---|
| Estado | **Implementada** · 2026-10-19 (`a37d0c7`, backend) |
| Fecha | 2026-10-19 |
| Origen | Definición del cliente: los adjuntos van a Azure Blob Storage; en desarrollo, Azurite |
| Repos | Backend (`portal-proveedores-backend`) |

## Contexto

Los archivos de los documentos (XML, PDF, CDR y anexos) se guardan hoy en el disco del servidor (`App_Data/documents`) y la tabla `DocumentAttachments` guarda su clave. El cliente usará **Azure Blob Storage**; en desarrollo se usa **Azurite**, el emulador oficial de Microsoft.

## Requisitos

### R1 · Adaptador de Blob Storage
- [x] Los archivos se guardan, leen y eliminan en un contenedor de Blob Storage, con la misma clave que hoy (`aaaa/mm/<guid>.<ext>`), sin cambios en la base ni en el resto del código.
- [x] El contenedor se crea si no existe al arrancar la API.
- [x] Las descargas siguen pasando por la API (con sus permisos); los blobs no son públicos.

### R2 · Proveedor configurable
- [x] `Storage:Provider` = `AzureBlob` | `Local`. Con `AzureBlob` se exige `Storage:ConnectionString` (y `Storage:Container`, por defecto `documents`); la API no arranca si falta.
- [x] `Local` mantiene el comportamiento actual (pruebas o un servidor sin Blob).
- [x] El log de arranque indica qué almacenamiento se usa (sin mostrar la clave de la cuenta).

### R3 · Azurite en desarrollo
- [x] `docker-compose.yml` levanta Azurite (puerto 10000) con volumen persistente; `scripts/dev-up.sh` lo inicia y espera.
- [x] `.env.example` trae la configuración de Azurite (`UseDevelopmentStorage=true`).

### R4 · Migración de los archivos en disco
- [x] Un comando copia los archivos de `App_Data/documents` al contenedor con las mismas claves, sin duplicar los que ya existen, y muestra cuántos copió.

### R5 · Pruebas
- [x] Prueba de integración contra Azurite real (Testcontainers): guardar, leer, eliminar y clave inválida.

## Decisiones

| ID | Pregunta | Decisión (2026-10-19) |
|---|---|---|
| D1 | ¿Se mantiene el disco local? | Sí, como opción `Storage:Provider=Local`; Blob por defecto en desarrollo. |
| D2 | ¿Cómo se levanta Azurite? | En `docker-compose` y `dev-up.sh`. |
| D3 | ¿Archivos ya guardados? | Se migran con un comando. |

## Fuera de alcance

- Cuenta de Azure de producción, red privada y llaves (los define el cliente; solo cambia `Storage:ConnectionString`).
- Descarga directa con URL firmada (SAS).
