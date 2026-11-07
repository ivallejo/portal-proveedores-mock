# Spec 011 · Informes de retención y detracción · Requisitos

| Campo  | Valor                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Estado | **En curso** · aprobada el 2026-11-06 con las propuestas D1–D6 |
| Fecha  | 2026-11-06                                                                                                                                                         |
| Origen | Diseño «Propuesta 4»: `Orden de pago · ver detalle (popup)` (`P4_OrdenPagoDetalle`) y `Orden de pago · vista previa constancia de detracción` (`P4_PdfDetraccion`) |
| Repos  | Frontend (nuestro). Sin cambios en el backend mientras SAP no entregue más datos (ver C-002)                                                                       |

## Qué pide el diseño

- En el detalle de la orden, bloque «Retención y detracción» de cada comprobante:
  - **Comprobante retenido:** botón con el número (`R001-0000…`), acción «Descargar comprobante de retención». En el diseño solo muestra un aviso: **no hay hoja de retención diseñada**.
  - **Información de la detracción:** botón «Constancia {número}», acción «Ver constancia de detracción», que abre la vista previa. Debajo sigue la tasa y «Banco de la Nación».
  - Sin retención o sin detracción se mantiene «No aplica», sin botón.
- La vista previa es una hoja A4 llamada **«Informe de detracciones»**, con archivo `Informe-detracciones-<constancia>.pdf`. Aclara que es solo informativa y que la constancia oficial se obtiene en SUNAT con Clave SOL. No es la constancia oficial: la genera el portal.

## Datos del informe frente a lo que entrega SAP hoy

| Dato del diseño                        | Disponible | Origen o situación                                                     |
| -------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| N° de constancia                       | Sí         | `detractionCertificate`                                                |
| Fecha de pago                          | Sí         | `paidAt` de la orden (no necesariamente la fecha del depósito en el BN) |
| Proveedor: razón social y RUC          | Sí         | `providerName`, `providerRuc`                                          |
| Adquiriente: razón social y RUC        | Sí         | `companyName`, `companyRuc` (el RUC puede venir vacío)                 |
| Tipo y número de comprobante           | Sí         | `type`, `number`                                                       |
| % de detracción                        | Sí         | `detractionRate`                                                       |
| Monto en la moneda de la orden         | Sí         | `detraction`                                                           |
| Monto en la otra moneda                | **No**     | SAP entrega un solo monto, sin tipo de cambio                          |
| N° de cuenta de detracciones (BN)      | **No**     | No viene en `zconsopago`                                               |
| T.Q. y T.B.S.                          | **No**     | No vienen en `zconsopago`; significado de T.Q. por confirmar           |
| Código de verificación y QR            | **No**     | El portal no tiene función para validar documentos                     |

## Requisitos

- [ ] **R1 · Botones:** el detalle muestra los dos botones con los textos del diseño y «No aplica» cuando no corresponde.
- [ ] **R2 · Vista previa de detracción:** el botón abre la vista previa con la hoja del diseño, zoom, imprimir y «Descargar PDF». Volver o Escape regresan al detalle, que sigue abierto.
- [ ] **R3 · Comprobantes del informe:** incluye todos los comprobantes de la orden con esa misma constancia; los totales son la suma de esos comprobantes.
- [ ] **R4 · Nombre del archivo:** al guardar se propone `Informe-detracciones-<constancia>.pdf`.
- [ ] **R5 · Aviso:** la hoja conserva el aviso de que el documento es solo informativo.
- [ ] **R6 · Datos faltantes:** ningún dato se inventa; se aplica lo que resuelvan D2, D3 y D4.
- [ ] **R7 · Retención:** según D1.

## Decisiones (aprobadas el 2026-11-06)

| ID | Decisión                                                 | Propuesta                                                                                                                                                                                                              |
| -- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 | Qué abre el botón de retención, que no tiene hoja diseñada | Un **«Informe de retenciones»** con la misma hoja y el mismo aviso informativo: número del comprobante de retención, fecha de pago, proveedor, agente de retención, comprobantes y monto retenido. No imita el comprobante oficial |
| D2 | Campos que SAP no entrega (cuenta BN, T.Q., T.B.S.)      | Mantener el campo y mostrar «—», como hace el propio diseño con T.Q. y T.B.S., hasta que SAP los entregue                                                                                                               |
| D3 | Código de verificación y QR                              | **Quitarlos:** el texto invita a validar en el portal una función que no existe. Mismo criterio que en la hoja de la orden de pago                                                                                       |
| D4 | Montos en soles y en dólares                             | El monto va en la columna y el total de la moneda de la orden; la otra moneda muestra «—». Sin conversión, porque no hay tipo de cambio                                                                                  |
| D5 | Descarga                                                 | Igual que la orden de pago: la impresión del navegador, con «Guardar como PDF». No genera el archivo directamente                                                                                                       |
| D6 | Dónde se trabaja                                         | Rama `feature/informes-retencion-detraccion` con PR en nuestro repo; al cliente solo cuando se pida                                                                                                                     |

## Fuera de alcance

- Constancia oficial de SUNAT o comprobante oficial de retención.
- Nuevos campos de SAP (consulta [C-002](../../consultas-negocio.md#c-002--datos-de-sap-para-los-informes-de-retención-y-detracción)).
- Función de validación por código o QR.
- Repos del cliente y Workflows.
