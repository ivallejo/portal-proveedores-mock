# Flujos de negocio

Flujos aprobados por negocio para el Portal de Proveedores. Son la fuente de verdad: los cambios al sistema parten de aquí (ver [specs](../specs/README.md)). Cada archivo tiene el diagrama (Mermaid), los actores, el estado final y las reglas.

| Flujo | Actor | Estado final | Versión |
|---|---|---|---|
| [01 · Registro con orden de compra](01-registro-con-oc.md) | Proveedor | Pendiente de contabilización | 2026-10-17 |
| [02 · Registro sin orden de compra](02-registro-sin-oc.md) | Proveedor o interno | Pendiente de aprobación (proveedor) · Pendiente de contabilización (interno) | 2026-10-17 |
| [03 · Documentos especiales](03-documentos-especiales.md) | Interno | Pendiente de contabilización | 2026-10-17 |
| [04 · Aprobaciones](04-aprobaciones.md) | Aprobador de área | Pendiente de contabilización · Rechazado · Pendiente de aprobación (reasignado) | 2026-10-17 |
| [05 · Contabilización](05-contabilizacion.md) | Cuentas por pagar | Rechazado · Observado | 2026-10-17 |

Para actualizar un flujo: editar su diagrama y reglas, cambiar la versión y abrir una spec con las diferencias frente a lo implementado.
