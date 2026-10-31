# Spec 005 · Rango de 1 mes y descarga en Excel · Requisitos

| Campo | Valor |
|---|---|
| Estado | **En curso** · aprobada el 2026-10-30 (D1–D4 según la propuesta) |
| Fecha | 2026-10-30 |
| Origen | Pedido del cliente: en Orden de pago y Estado de factura, rango máximo de 1 mes (validado en front y back) y botón para descargar en Excel |
| Repos | Backend y frontend (nuestros y del cliente) |

## Contexto

Orden de pago y Estado de factura consultan SAP con un rango de fechas de hasta **3 años** (`PaymentQueryService.MaxRangeDays = 3 * 366` en el backend; `MAX_QUERY_DAYS` en `features/payments/domain/rules/supplier-rules.ts` en el front). El periodo por defecto son los últimos 3 meses. Los resultados solo se ven en pantalla: no hay exportación.

## Requisitos

### R1 · Rango máximo de 1 mes (backend)

- [x] Las dos consultas (`GET /api/payments/payment-orders` y `GET /api/payments/invoices`) rechazan un rango de más de **31 días contando ambos extremos** (D1) con 400 y el mensaje «El rango de fechas no puede superar 1 mes (31 días).».
- [x] Se mantiene la regla «la fecha inicial no puede ser posterior a la final».

### R2 · Rango máximo de 1 mes (front)

- [x] El selector de fechas de ambas pantallas no deja elegir más de 31 días.
- [x] El texto bajo los filtros dice «rango máximo de 1 mes».
- [x] El periodo por defecto pasa a los **últimos 31 días hasta hoy** (D2): el actual de 3 meses ya no sería válido.
- [x] Si el backend responde el error de rango, se muestra su mensaje.

### R3 · Descarga en Excel (backend)

- [x] Endpoints `GET /api/payments/payment-orders/export` y `GET /api/payments/invoices/export` con los mismos parámetros que la búsqueda; devuelven un `.xlsx` (D3).
- [x] Aplican las mismas reglas que la búsqueda: acceso por rol, RUC propio del proveedor, sociedades asignadas y rango de 1 mes.
- [x] Orden de pago: una fila por comprobante pagado, con los datos de la orden repetidos (D4). Estado de factura: una fila por factura con las columnas de la tabla.
- [x] Encabezados en negrita, fechas como fecha, importes como número con 2 decimales, columnas ajustadas.

### R4 · Botón «Descargar Excel» (front)

- [x] En ambas pantallas, junto a los resultados, un botón «Descargar Excel» habilitado cuando la última búsqueda trajo resultados.
- [x] Descarga con los filtros de la **última búsqueda aplicada** (no los que se están editando), muestra «Descargando…» mientras tanto y avisa si falla.
- [x] Nombre del archivo: `ordenes-de-pago_<RUC>_<desde>_<hasta>.xlsx` y `estado-de-facturas_<RUC>_<desde>_<hasta>.xlsx`.

## Decisiones

| # | Decisión | Propuesta | Decide |
|---|---|---|---|
| D1 | Qué es «1 mes» | 31 días contando ambos extremos (cubre cualquier mes calendario, p. ej. 1 al 31 de octubre). Alternativa: mes calendario exacto (del 15/09 al 15/10), más difícil de explicar en el calendario | Usuario |
| D2 | Periodo por defecto | Últimos 31 días hasta hoy | Usuario |
| D3 | Dónde se arma el Excel | En el backend con ClosedXML (MIT): reaplica permisos y rango, y el front no carga una librería pesada | Usuario |
| D4 | Formato de Orden de pago | Una hoja, una fila por comprobante pagado con los datos de la orden repetidos (se puede filtrar y sumar en Excel). Alternativa: dos hojas (órdenes y comprobantes) | Usuario |

## Fuera de alcance

- Exportar a otros formatos (CSV, PDF de la lista).
- Cambiar los filtros o columnas de las pantallas.
