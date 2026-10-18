# Spec 001 · Flujos documentales v2 · Diseño

Cómo se implementa cada requisito de [requisitos.md](requisitos.md). Decisiones cerradas: **D1** se elimina Caja Chica; **D2** Con OC solo proveedor y administrador.

## R1 · Sin OC del usuario interno

**Backend** (`WebProveedores.Application/Documents/DocumentRegistrationService.cs`):
- `needsApproval = EntryType == WithoutPurchaseOrder && actor.IsProvider && !actor.IsAdmin`. El aprobador solo se exige y se valida en ese caso.
- Un usuario interno que envía `ApproverId` → se ignora (no es error), así un front antiguo no rompe.
- Se quita `IsPettyCash` del command, del request (`Api/Contracts/Documents`), de la entidad (`SupplierDocument.IsPettyCash` + migración que elimina la columna) y de las respuestas. El historial de cada documento conserva la nota de cómo se registró.
- Pruebas: interno Sin OC → Pendiente de contabilización sin aprobador ni correo; proveedor Sin OC sin aprobador → 400.

**Front** (`features/documents`):
- `RegisterDocumentFacade.pendingApproval = entry === 'sin' && !isInternal()`.
- `register-order-data`: si es interno, no se muestran Área ni Aprobador; aviso «Como usuario interno se registra directo como Pendiente de contabilización» (texto del prototipo Propuesta 4).
- Se quitan `pettyCash`, `canPettyCash`, `canRegisterPettyCash` y `isPettyCash` del command y del adaptador HTTP.
- Requisito del pie: «Área y aprobador» solo para proveedores.

## R2 · Detalle del documento electrónico

**Front**:
- Componente nuevo `components/electronic-document-summary` (presentación pura): recibe `ElectronicDocument` y muestra tipo y N°, emisor (razón social · RUC), fecha de emisión, moneda y total, en un recuadro bajo las filas de archivos.
- Se muestra cuando `facade.xmlDocument()` existe y `fromXml` es `true`.
- Sin cambios de backend: el XML se lee en el front (`ReadElectronicDocumentUseCase`) y el backend lo vuelve a validar al registrar.

## R3 · Correo de observación con adjuntos

**Backend**:
- `IEmailSender.SendAsync` gana un parámetro opcional `IReadOnlyList<EmailAttachment>? attachments` (record nuevo en `Ports/Outbound/Notifications/Models`: `FileName`, `ContentType`, `Content`).
- `SmtpEmailSender` (System.Net.Mail) agrega los adjuntos al `MailMessage`; `RedirectingEmailSender` y `LogEmailSender` los propagan o los registran (nombre y tamaño).
- `DocumentNotifier.ObservedAsync` recibe los adjuntos; `DocumentAccountingService.ObserveAsync` los arma con `IFileStorage.OpenReadAsync` a partir de los `DocumentAttachment` del documento.
- Límite: si la suma supera `Email:MaxAttachmentBytes` (por defecto 20 MB), se envía sin adjuntos y el cuerpo indica que se revisen en el portal.
- Pruebas: el correo de observación lleva los adjuntos; con adjuntos sobre el límite se envía sin ellos.

**Front**: en el panel «Observar» de Contabilización, una línea: «El correo incluye los archivos del documento».

## R4 · Con OC solo para el proveedor

- **Front**: `ENTRY_CARDS` / `entryCards()`: «Con orden de compra» solo si el usuario es proveedor o administrador (regla en `domain/rules/document-rules.ts`, con prueba).
- **Backend**: en `RegisterElectronicAsync`, Con OC de un actor que no es proveedor ni administrador → `ForbiddenException` (403). Prueba.

## R5 · Texto

- `register-order-data.component.html`: «N° de orden de compra» para Servicio.

## Documentación al cerrar

- `docs/FLUJO_ACTUAL.md` (secciones 2, 4 y 5) y `docs/AGENT_CONTEXT.md` (reglas de registro).
- Backend: `docs/AGENT_CONTEXT.md` (reglas de registro y correo con adjuntos).
- Esta spec pasa a estado **Implementada** con los commits de cada tarea.
