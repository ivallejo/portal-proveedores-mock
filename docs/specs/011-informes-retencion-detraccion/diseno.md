# Spec 011 · Diseño

Asume las propuestas de `requisitos.md`; si una decisión cambia, se actualiza primero este archivo.

## Dominio (`features/payments/domain`)

- `models/withholding-report.ts`: `WithholdingReport` con `kind` (`detraction` o `retention`), `number`, la orden y sus comprobantes.
- `rules/withholding-report-rules.ts`: arma el informe de un número, filtra por `detractionCertificate` o `retentionDocument`, y calcula el total y el nombre del archivo. Con pruebas unitarias.

## Presentación (`features/payments/presentation`)

- `payment-order-detail-dialog`: los dos botones, con el estilo del diseño (34 px, borde `#DCE5F2`, fondo `#F4F8FE`, texto primario), `aria-label` y `title`. Salida hacia la fachada.
- `withholding-report-sheet` (nuevo): hoja A4 del informe. Reutiliza encabezado y estilos de `payment-order-pdf-sheet`. Usa la marca hexagonal de la hoja de la orden, porque el logo del diseño no está en el repo.
- `payment-order-pdf-viewer`: se reutiliza para no duplicar zoom, impresión y cierre. Recibe qué documento mostrar; nombre, subtítulo y hoja salen de ese documento. Se omite «1 página · 96 KB» y el estado «Generando vista previa…», porque la hoja se pinta al instante.
- `payment-order-list.facade`: la señal `pdf` pasa a ser el documento abierto (orden o informe), con `openReport(...)`. Cerrar deja el detalle abierto.
- `styles.css`: sin cambios si el selector de impresión del visor sigue siendo válido.

## Backend

Sin cambios: todo lo disponible ya llega en `PaidDocumentResponse`.

## Pruebas

- Unitarias de las reglas: agrupación por constancia, totales por moneda, nombre del archivo.
- Componente: botones y «No aplica» según el comprobante.
- Navegador: sin conexión a SAP en local, las órdenes se simulan interceptando la respuesta de la API solo durante la prueba, sin dejar código en el repo. La prueba con SAP real queda pendiente de QAS o VPN.
