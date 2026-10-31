# Spec 006 · Usuario libre y documento de identidad · Requisitos

| Campo | Valor |
|---|---|
| Estado | **En curso** · aprobada el 2026-10-30 (D1 y D3 como se propusieron; D2: se ingresa solo con el usuario) |
| Fecha | 2026-10-30 |
| Origen | Pedido del cliente: el usuario del personal interno hoy es su DNI; debe ser un texto libre, con el documento en un campo aparte |
| Repos | Backend y frontend (nuestros y del cliente) |

## Contexto

`AppUser` ya tiene `Username` y `Dni` por separado, pero el alta del administrador usa el DNI como usuario. El login acepta usuario, RUC, DNI o correo verificado. El proveedor usa su RUC como usuario.

## Requisitos

### R1 · Proveedor
- [x] Su usuario sigue siendo su RUC (registro online, alta del administrador y seed). No se edita.

### R2 · Documento del personal interno (D1)
- [x] Tipo y número: **DNI** (8 dígitos), **Carné de extranjería** o **Pasaporte** (letras y números, hasta 12).
- [x] No se repite entre usuarios (mismo tipo y número). Se indica al crear y no se edita.

### R3 · Usuario del personal interno
- [x] Texto libre de 4 a 50 caracteres: letras, números, `.`, `_` y `-`; sin espacios ni `@`; no puede ser 11 dígitos (parecería un RUC).
- [x] Único sin distinguir mayúsculas.
- [x] Al crear, el formulario propone uno con la inicial del nombre y el primer apellido (p. ej. `jperez`); el administrador lo puede cambiar.

### R4 · Ingreso (D2)
- [x] Se ingresa **solo con el usuario** (el del proveedor es su RUC; se acepta el RUC aunque una cuenta antigua tenga otro usuario). El correo y el DNI dejan de servir para ingresar.

### R5 · Cambio de usuario (D3)
- [x] El administrador puede cambiar el usuario de un interno; se le envía un correo con su nuevo usuario.

### R6 · Datos existentes
- [x] Migración: `Dni` pasa a `DocumentNumber` y se agrega `DocumentType` (los que tenían DNI quedan con tipo DNI). Los usuarios actuales conservan su usuario.
- [x] Seed: `documentType` + `documentNumber`; `dni` se sigue aceptando (equivale a DNI). El usuario del proveedor debe ser su RUC.

### R7 · Pantallas
- [x] Configuración › Usuarios: tipo y número de documento y usuario (solo internos) en el alta; usuario editable en la edición; listado con usuario y documento; la búsqueda encuentra por ambos.
- [x] Mi perfil muestra el usuario y el documento (solo lectura).
- [x] Login: el campo sigue siendo «RUC o usuario».

## Fuera de alcance
- Cambiar el documento después del alta.
- Recuperar contraseña del personal interno desde el login (sigue siendo por el administrador).
