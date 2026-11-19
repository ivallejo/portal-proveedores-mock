# Spec 012 · Diseño

Asume las propuestas de `requisitos.md`; si una decisión cambia, se actualiza primero este archivo.

## Backend

- **Dominio:** `DeliveryType` (`OnBoard`, `Warehouse`) y propiedad opcional `DeliveryType?` en `SupplierDocument` (solo Con OC de Servicio). Regla: con Bien no se acepta tipo de entrega.
- **Migración** `AddDeliveryType`: columna `DeliveryType` nula en `Documents`; los Con OC de Servicio existentes quedan en `OnBoard` (D3).
- **Contratos:** `DeliveryType` en `RegisterDocumentForm` y `ValidateOrderRequest`; `DocumentDetailResponse` lo devuelve.
- **SAP 01:** `ISapDocumentGateway.ValidateOrderAsync` recibe el tipo de entrega. El simulador agrega `CR-2026-00527` (Servicio · almacén) y valida carrier o número de orden según el caso.
- **Registro:** sin cambios de reglas; ya valida la orden en el servidor al registrar (`DocumentRejectedException`, 422), así que R2 no necesita endpoint nuevo.
- **Pruebas:** dominio (tipo de entrega solo con Servicio), simulador y registro con almacén.

## Frontend (`features/documents`)

- **Dominio:** `DeliveryType` y regla `orderNumberKind(orderType, delivery)` → `carrier` | `order` (etiqueta, ejemplo y texto de error). Pruebas unitarias.
- **`register-order-data`:** segmentado «Tipo de entrega» con Servicio; sin botón «Validar orden»; error de orden bajo el número.
- **`register-files`:** se quita el bloqueo y el aviso de candado.
- **`register-document.facade`:** se elimina `filesLocked`; `register()` llama a validar la orden y, si es válida, registra; el avance usa el número en lugar de «Orden validada»; textos de resultado de R3 en una regla de dominio (`registerResultText`) para probarlos sin la pantalla.
- **Detalle de bandejas:** muestra «Tipo de entrega» en la orden de compra cuando existe.

## Flujos

- Flujo 01, versión nueva: rama Servicio → tipo de entrega; validación de la orden al registrar (D2).

## Pruebas

- Unitarias de reglas y de la fachada (validación al registrar, orden inválida conserva archivos).
- Navegador: Con OC Servicio a bordo, Servicio almacén, Bien, orden inválida; Sin OC proveedor e interno; Especiales con error.
