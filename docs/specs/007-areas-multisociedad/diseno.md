# Spec 007 · Áreas en varias sociedades · Diseño

## Backend
- Dominio: `AreaCompany` (AreaId, CompanyId) y `Area.Companies`, con `Area.SetCompanies`; se quita `Area.CompanyId`. `Area.Code` único en todo el portal.
- Migración `AreaCompanies`: crea la tabla, la llena con `Areas.CompanyId`, une duplicados por `Code` (repunta `Users.AreaId` y `Documents.AreaId`), quita la columna y crea el índice único por `Code`.
- Organización: `SaveAreaCommand.CompanyIds`; `AreaAdminResponse.Companies` (`AreaCompanyResponse`: id, código, nombre). Al quitar sociedades, `IOrganizationRepository` informa los usuarios del área sin sociedades en común y si hay documentos pendientes de aprobación del área en las sociedades quitadas.
- Usuarios: `AdminAreaOption.CompanyCodes`; validación «el área comparte al menos una sociedad con el usuario».
- Catálogo: `AreaResponse.CompanyCodes` (desde `ApproverRecord.AreaCompanyCodes`).
- Perfil: `AreaCompanyName` con las sociedades del área que el usuario tiene asignadas.
- Seed: `SeedArea.Companies` (y `Company`); usuarios con el nombre del área o `CÓDIGO:Nombre`.

## Front
- `areas`: formulario con casillas de sociedades; listado con insignias; filtro por sociedad.
- `users`: opciones de área filtradas por intersección de sociedades; regla `userAreaError` con `companyCodes`.
- `catalog`/`documents`: `areasOfCompany` con `companyCodes`.
