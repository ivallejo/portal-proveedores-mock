# Spec 012 · Registro de documentos según la Propuesta 4 · Requisitos

| Campo  | Valor                                                                                                                                                                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estado | **Aprobada** · 2026-11-19: se sigue el flujo de la Propuesta 4 con las propuestas D1–D4                                                                                                   |
| Fecha  | 2026-11-19                                                                                                                                                                                |
| Origen | Diseño «Propuesta 4», pantallas de registro (`P4_RegistrarDoc` y sus 18 estados: Con OC, Sin OC y Especiales) comparadas con lo implementado                                              |
| Repos  | Frontend y backend (nuestros); al cliente solo cuando se pida                                                                                                                             |
| Flujos | [01 · Con OC](../../flujos/01-registro-con-oc.md) (cambia), [02 · Sin OC](../../flujos/02-registro-sin-oc.md) y [03 · Especiales](../../flujos/03-documentos-especiales.md) (solo textos) |

## Situación

La pantalla Registrar documentos ya tiene la estructura de la Propuesta 4: tarjetas de tipo de ingreso, filas de archivos con arrastre, avance «Faltan N pasos», extras que en Sin OC se unen en un solo PDF, área y aprobador, aviso del usuario interno, CDR no requerido en serie E y botones del resultado. Quedan tres diferencias.

## Requisitos

### R1 · Tipo de entrega en órdenes de Servicio

- [ ] Con tipo de orden **Servicio** aparece «Tipo de entrega»: **Entregado a bordo** (por defecto) o **Entregado en almacén**. Con **Bien** no aparece.
- [ ] El campo del número se llama **N° de carrier** (ej. `CR-2026-00527`) con Bien o con Servicio entregado en almacén, y **N° de orden de compra** (ej. `4500012873`) con Servicio entregado a bordo.
- [ ] Cambiar el tipo de orden o de entrega limpia el número y el resultado de la validación.
- [ ] El tipo de entrega se envía al backend, se guarda en el documento y se muestra en el detalle de las bandejas.
- [ ] La validación en SAP (servicio 01) usa lo que defina D1 para el carrier de almacén.

### R2 · La orden se valida al registrar

- [ ] Desaparece el botón «Validar orden»; los archivos se pueden cargar desde el inicio, sin el aviso «Valida la orden para habilitar la carga».
- [ ] «Registrar documento» valida primero la orden (barra «Validando orden», botón «Validando orden…») y, si es válida, registra («Registrando…»).
- [ ] Si la orden no es válida: no se registra, el número queda marcado en rojo con «SAP no encontró la orden de compra | el carrier {N°} para la sociedad seleccionada, o ya no tiene saldo por facturar. Corrige el número y vuelve a registrar.» y el pie muestra «No se registró el documento: la orden no es válida en SAP.». Los archivos cargados se conservan.
- [ ] El avance cuenta «N° de orden de compra» o «N° de carrier» como paso cuando hay número (ya no «Orden validada»).
- [ ] Sujeto a D2: cambia la regla del flujo 01 «los archivos se habilitan solo con la orden validada».

### R3 · Textos del resultado

- [ ] Éxito, datos siempre en este orden: **N° de documento, Sociedad, Importe, Estado**.
- [ ] Éxito Con OC: «La factura {N°} quedó asociada a la orden {N° de orden} con estado Pendiente de contabilización.»
- [ ] Éxito Sin OC del proveedor: «La factura {N°} fue enviada a {aprobador} para su aprobación. Le enviamos un correo con el detalle.»
- [ ] Éxito Sin OC del usuario interno: «La factura {N°} se registró directamente como Pendiente de contabilización.»
- [ ] Éxito Especiales: «El {tipo de documento} {N°} se registró correctamente con estado Pendiente de contabilización.»
- [ ] Error electrónico: «SAP rechazó el documento {N°}: ya fue registrado anteriormente para {sociedad} o su contenido no coincide con la validación de SUNAT.» Si el backend devuelve un motivo más preciso (por ejemplo, el RUC del XML no es el del proveedor), se muestra ese motivo.
- [ ] Error Especiales: «SUNAT no reconoce el documento {N°} para el RUC {RUC}, o ya fue registrado en SAP. Verifica los datos del documento.»
- [ ] «La factura» se usa solo cuando el comprobante es una factura; para otros tipos (nota de crédito, recibo por honorarios) se usa su nombre.

## Decisiones (aprobadas el 2026-11-19)

| ID  | Decisión                                                                                           | Propuesta                                                                                                                                                                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Qué valida SAP con Servicio entregado en almacén: ¿un carrier, como Bien, en el mismo servicio 01? | Tratarlo como carrier en el servicio 01, con un nuevo valor de tipo de entrega en la consulta. Mientras SAP siga simulado, el simulador acepta `CR-2026-00527` como carrier de almacén. Solo falta que SAP confirme el dato real del servicio 01 ([C-003](../../consultas-negocio.md#c-003--tipo-de-entrega-y-validación-de-la-orden-en-el-registro-con-oc)) |
| D2  | Validar la orden al registrar en lugar de antes de cargar archivos                                 | Aceptar el diseño y actualizar el flujo 01 (versión nueva). Riesgo menor: el proveedor puede cargar archivos y descubrir al final que la orden no es válida; los archivos se conservan para corregir el número                                                                                                                                               |
| D3  | Documentos ya registrados con Servicio: ¿qué tipo de entrega tienen?                               | «Entregado a bordo», que es lo que se validaba hasta hoy                                                                                                                                                                                                                                                                                                     |
| D4  | Dónde se trabaja                                                                                   | Rama `feature/registro-propuesta-4` con PR en nuestros repos; al cliente cuando se pida                                                                                                                                                                                                                                                                      |

## Fuera de alcance

- Módulo **Orden de compra** del menú de la Propuesta 4 (`P4_OrdenCompra`): no existe en el portal; si se quiere, va en su propia spec.
- Servicios SAP 01/02 reales (siguen simulados).
- Cambios en las bandejas de aprobación y contabilización, salvo mostrar el tipo de entrega.
