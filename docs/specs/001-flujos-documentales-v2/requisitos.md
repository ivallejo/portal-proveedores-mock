# Spec 001 · Flujos documentales v2 · Requisitos

| Campo | Valor |
|---|---|
| Estado | **Implementada** · 2026-10-18 (aprobada el mismo día; D1 y D2 cerradas) |
| Fecha | 2026-10-17 |
| Origen | Flujos actualizados entregados por negocio (`docs/flujos/01`–`05`) |
| Repos | Front (`portal-proveedores-mock`) y backend (`portal-proveedores-backend`) |

## Contexto

Negocio entregó la versión actualizada de los cinco flujos documentales. Se compararon con lo implementado (front y backend, `main` al 2026-10-17). Aprobaciones y Documentos especiales ya cumplen; esta spec cubre las diferencias.

| Flujo | Situación |
|---|---|
| [01 · Con OC](../../flujos/01-registro-con-oc.md) | Difiere: R2, R4, R5 |
| [02 · Sin OC](../../flujos/02-registro-sin-oc.md) | Difiere: R1, R2 |
| [03 · Documentos especiales](../../flujos/03-documentos-especiales.md) | Cumple |
| [04 · Aprobaciones](../../flujos/04-aprobaciones.md) | Cumple |
| [05 · Contabilización](../../flujos/05-contabilizacion.md) | Difiere: R3 |

## Requisitos

### R1 · Sin OC: el usuario interno registra directo a contabilización

**Hoy:** el usuario interno elige área y aprobador, salvo que marque «Documento de Caja Chica» (entonces va directo a contabilización). El backend exige aprobador salvo Caja Chica.
**Flujo 02:** el usuario interno **no** elige área ni aprobador; su documento queda en **Pendiente de contabilización**. El proveedor sigue eligiendo área y aprobador.

Criterios de aceptación:
- [x] Un usuario interno en Sin OC no ve Área ni Aprobador; un aviso indica que se registra directo como Pendiente de contabilización.
- [x] Al registrar, el documento queda en **Pendiente de contabilización** sin aprobador y no se envía correo de aprobación.
- [x] Un proveedor en Sin OC sigue eligiendo área y aprobador; el documento queda en **Pendiente de aprobación** y se envía el correo al aprobador.
- [x] El backend aplica la regla según el rol de quien registra (no según un dato del formulario).
- [x] Se elimina «Documento de Caja Chica» (D1).

### R2 · Con OC y Sin OC: mostrar el detalle del documento electrónico antes de registrar

**Hoy:** con el diseño de la Propuesta 4 (commit `2d31094`) ya no hay paso de revisión; los datos del XML no se muestran.
**Flujos 01 y 02:** después de adjuntar los archivos se muestra el **detalle del documento electrónico** y luego se valida en SAP/SUNAT.

Criterios de aceptación:
- [x] Al terminar de leer el XML se muestra un resumen en la columna «Archivos»: tipo y N° de documento, emisor (razón social y RUC), fecha de emisión, moneda y total.
- [x] Se mantiene el diseño de la Propuesta 4 (una sola tarjeta, sin volver al asistente de pasos).
- [x] Si el XML no se puede leer, se mantiene el error en la fila del XML y no se registra.

### R3 · Contabilización: el correo de «Observar» lleva los documentos adjuntos

**Hoy:** el correo lleva el motivo (con copia al correo de facturación de la sociedad), sin archivos.
**Flujo 05:** se envía al usuario interno indicado **con el motivo y los documentos adjuntos**.

Criterios de aceptación:
- [x] El correo de observación adjunta los archivos del documento: XML, PDF, CDR (si existe) y el PDF de extras consolidado (si existe); en documentos especiales, el PDF.
- [x] Si los adjuntos superan el límite del servidor de correo, se envía el correo sin adjuntos con un aviso de que se revisen en el portal (y queda en el log).
- [x] La pantalla de Contabilización indica que el correo incluye los adjuntos.

### R4 · Con OC: solo lo registra el proveedor

**Hoy:** usuario interno y administrador también ven y usan «Con orden de compra».
**Flujo 01:** el actor es el **usuario proveedor**.

Criterios de aceptación:
- [x] (D2) El usuario interno no ve la tarjeta «Con orden de compra» y el backend rechaza (403) un registro Con OC de alguien que no es proveedor ni administrador.

### R5 · Con OC: texto del número de orden

**Hoy:** «N° de orden de servicio» (tomado del prototipo Propuesta 4).
**Flujo 01:** «N° de orden de compra» para el tipo Servicio («N° de carrier» para Bien no cambia).

Criterios de aceptación:
- [x] La etiqueta para Servicio es «N° de orden de compra».

## Decisiones

| ID | Pregunta | Decisión (2026-10-18) |
|---|---|---|
| **D1** | ¿Qué pasa con **Caja Chica**? | **Se elimina.** Todo documento Sin OC de un usuario interno va directo a Pendiente de contabilización. |
| **D2** | ¿**Con OC** es solo para proveedores? | **Proveedor y administrador** (el administrador la conserva para soporte). Los usuarios internos no la ven y el backend responde 403. |

## Fuera de alcance

- Servicios SAP 01 y 02 reales (hoy simulados en el backend) y SUNAT: dependen de SAP.
- Estado **Contabilizado** (servicio 03).
- El estado **Aprobado** como estado visible: el flujo 04 lo nombra como paso intermedio; hoy el documento pasa directo a Pendiente de contabilización y el historial registra la aprobación. Se mantiene así.
