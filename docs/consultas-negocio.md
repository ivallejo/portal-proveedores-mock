# Consultas a negocio

Huecos y dudas encontrados al probar o implementar el portal que necesitan una definición del usuario antes de construirse. Cuando se decide una consulta, se anota la decisión y, si cambia el comportamiento, se abre su spec en [`specs/`](specs/README.md) (y se actualiza el flujo en [`flujos/`](flujos/README.md) si corresponde).

**Estados:** `Abierta` → `Decidida` (con spec o sin cambios) · `Descartada`.

| ID | Tema | Estado | Spec |
|---|---|---|---|
| [C-001](#c-001--seguimiento-de-los-documentos-por-el-proveedor) | Seguimiento de los documentos por el proveedor | Abierta | — |

---

## C-001 · Seguimiento de los documentos por el proveedor

| Campo | Valor |
|---|---|
| Estado | **Abierta** |
| Fecha | 2026-10-19 |
| Origen | Prueba del [flujo 01](flujos/01-registro-con-oc.md) con el proveedor Saga Falabella (`F001-00000601`) |
| Flujos | 01 · Con OC, 02 · Sin OC |

**Situación actual:** el documento se registra y se guarda (estado, archivos e historial), pero **el proveedor no tiene ninguna pantalla donde verlo**. Su menú es Inicio, Orden de pago, Estado de factura y Registrar documentos:

- **Estado de factura** consulta SAP en línea, no la base del portal: una factura registrada en el portal aparece ahí recién cuando SAP la tiene.
- Las bandejas del portal son solo para personal interno: **Documentos** (aprobador) y **Contabilización** (Cuentas por pagar).
- El proveedor solo se entera por correo cuando su documento es rechazado u observado; no sabe si quedó pendiente de aprobación o de contabilización.

Los flujos 01 y 02 terminan en «Registrar documento» y no indican cómo hace seguimiento el proveedor.

**Preguntas:**
1. ¿El proveedor debe ver los documentos que registró en el portal y su estado (pendiente de aprobación, pendiente de contabilización, observado, rechazado)?
2. ¿Debe ver el detalle: archivos, historial y los motivos de rechazo u observación?
3. ¿Puede actuar sobre un documento **observado** (por ejemplo, reemplazar archivos o volver a enviarlo) o solo verlo y registrar uno nuevo?
4. ¿Dónde se ubica: una opción nueva del menú («Mis documentos») o dentro de «Estado de factura» junto con lo que viene de SAP?
5. ¿El usuario interno también necesita ver los documentos que él registró (Sin OC y especiales)?

**Propuesta (para conversar):** bandeja de solo lectura «Mis documentos» con los documentos registrados por el proveedor (o por el usuario), filtros por estado y fecha, y el detalle con archivos e historial, reutilizando los componentes de Documentos y Contabilización. La corrección de documentos observados quedaría como un segundo paso si negocio la pide.

**Decisión:** _pendiente_
