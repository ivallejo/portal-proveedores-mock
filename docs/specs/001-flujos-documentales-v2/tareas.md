# Spec 001 · Flujos documentales v2 · Tareas

Cada tarea es un commit verificado (build, pruebas y `npm run quality` / `dotnet test`). Al cerrarla se marca y se anota el commit.

Decisiones D1 y D2 cerradas el 2026-10-18: todas las tareas habilitadas.

## Backend

- [x] **T1** · Sin OC: aprobación solo para proveedores (`needsApproval` por rol) + pruebas. *(R1)* — `1a6f426 (backend)`
- [x] **T2** · Quitar Caja Chica: command, request, entidad (migración que elimina la columna) y respuestas. *(R1 · D1)* — `1a6f426 (backend)`
- [x] **T3** · Con OC solo proveedor o administrador (403) + prueba. *(R4 · D2)* — `1a6f426 (backend)`
- [x] **T5** · `EmailAttachment` y adjuntos en `IEmailSender` y sus adaptadores (SMTP, Redirect, Log) + pruebas. *(R3)* — `9a6b2cb (backend)`
- [x] **T6** · Observar en Contabilización envía los archivos del documento, con límite de tamaño + pruebas. *(R3)* — `9a6b2cb (backend)`

## Front

- [x] **T4** · Sin OC: el interno no elige área ni aprobador (aviso del prototipo); quitar Caja Chica (facade, command, adaptador, pruebas). *(R1 · D1)* — `616b814`
- [x] **T7** · Resumen del documento electrónico bajo los archivos (componente + prueba). *(R2)* — `este commit`
- [x] **T8** · Contabilización › Observar: aviso de que el correo lleva los archivos. *(R3)* — `este commit`
- [x] **T9** · «Con orden de compra» solo para proveedor o administrador (regla + prueba). *(R4 · D2)* — `616b814`
- [x] **T11** · Etiqueta «N° de orden de compra» para Servicio. *(R5)* — `616b814`

## Cierre

- [x] **T10** · Actualizar `FLUJO_ACTUAL.md` y los `AGENT_CONTEXT.md` de ambos repos; marcar la spec como **Implementada**. — `este commit`
- [x] Prueba en el navegador contra el backend local: el interno solo ve Sin OC y Especiales, el aviso de registro directo y el detalle del XML. (Registro real y correo con adjuntos: pendiente con un XML válido y SAP.)
