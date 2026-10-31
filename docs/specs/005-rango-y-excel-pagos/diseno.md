# Spec 005 · Rango de 1 mes y descarga en Excel · Diseño

## Backend

- `PaymentQueryService.MaxRangeDays = 31`; la validación cuenta ambos extremos: `to.DayNumber - from.DayNumber + 1 > MaxRangeDays`.
- Puerto de salida genérico `ISpreadsheetWriter` (`Ports/Outbound/Files`, modelos `Spreadsheet`, `SpreadsheetColumn`, `SpreadsheetFormat`) → `byte[]`; adaptador `ClosedXmlSpreadsheetWriter` en `Infrastructure/Files` (ClosedXML 0.105). Columnas y filas en `Application/Payments/PaymentSpreadsheets`, así el puerto no depende de pagos.
- `IPaymentQueryService.ExportPaymentOrdersAsync` / `ExportInvoicesAsync` reutilizan la búsqueda y devuelven `ExportFileResponse` (nombre y contenido).
- `PaymentsController`: `GET payment-orders/export` e `invoices/export` llaman a la misma búsqueda del servicio y devuelven `File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nombre)`.
- Columnas Orden de pago: N° orden de pago, Sociedad, RUC sociedad, Fecha de pago, Forma de pago, Banco, Cuenta, Documento de pago, Moneda, Total pagado, N° comprobante, Tipo, Fecha de emisión, Importe, Retención, Detracción, Pagado, Comprobante de retención, Constancia de detracción.
- Columnas Estado de factura: N° de factura, Tipo, RUC, Sociedad, Importe, Moneda, Fecha de emisión, Detracción (Sí/No), Retención (Sí/No), Estado.
- Pruebas: rango de 31 días aceptado y de 32 rechazado; el Excel trae los encabezados y una fila por comprobante; el proveedor no puede exportar otro RUC.

## Front

- `MAX_QUERY_DAYS = 31`; `defaultQueryPeriod` = hoy − 30 días hasta hoy. Textos «rango máximo de 1 mes».
- Puertos de salida de payments con `export(filter)` → `Blob`; adaptadores HTTP con `responseType: 'blob'` y `core/http/to-user-facing-blob-error` para mostrar el mensaje del backend; casos de uso `ExportPaymentOrdersUseCase` / `ExportInvoicesUseCase` y tokens en `di/`.
- `saveBlob` pasa de `documents/presentation/browser` a `shared/utils/save-blob.util.ts` para usarlo en ambas features.
- Fachadas: guardan el filtro de la última búsqueda aplicada; `download()` con señal `downloading` y error.
- Botón «Descargar Excel» (`btn-secondary`, ícono de descarga) en la cabecera de la página (`app-page-header`), habilitado cuando hay resultados.
- Pruebas: reglas de rango y periodo por defecto; la fachada descarga con el último filtro aplicado.
