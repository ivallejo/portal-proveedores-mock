# Spec 006 · Usuario libre y documento de identidad · Diseño

## Backend
- Dominio: `IdentityDocumentType` (`Dni`, `ForeignerCard`, `Passport`), `IdentityDocument` (validación y normalización del número) y `UsernamePolicy` (reglas del usuario). `AppUser`: `DocumentType`/`DocumentNumber` en lugar de `Dni`; `ChangeUsername` solo para internos.
- EF: columna `DocumentType` (texto, 20) y `DocumentNumber` (12) con índice único filtrado por ambos. Migración `UserIdentityDocument` que renombra `Dni` y marca DNI en los existentes.
- Login: `FindForLoginAsync` busca por `Username` o, para el proveedor, por `Ruc` (cuentas antiguas pueden tener otro usuario); collation CI de SQL Server. La regla «usuario del proveedor = RUC» se aplica en el alta, el registro y el seed, no en `AppUser.Create`.
- Listado: `AdminUserSummary.Username`.
- Administración: `SaveUserCommand` con `DocumentType`, `Document` y `Username`. Códigos en la API: `DNI`, `CE`, `PASAPORTE` (y `RUC` para el proveedor; `Usuario` si un interno antiguo no tiene documento). Unicidad con `DocumentExistsAsync` y `UsernameUsedByOtherAsync`. Si cambia el usuario, correo `EmailTemplates.UsernameChanged`.
- Perfil: devuelve `username`, `documentType` y `document`.
- Pruebas: reglas del usuario y del documento, alta y edición, login solo por usuario, seed con `dni` y con `documentType`.

## Front
- `users`: reglas `usernameError`, `suggestUsername`, `documentNumberError`; formulario con tipo de documento (select), número y usuario; columna «Usuario» en el listado.
- `profile`: usuario y documento en solo lectura.
