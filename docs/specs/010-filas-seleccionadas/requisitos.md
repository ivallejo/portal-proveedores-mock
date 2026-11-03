# Spec 010 · Fila seleccionada en las tablas · Requisitos

| Campo  | Valor                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Estado | **En curso** · aprobada el 2026-11-03                                                                                                                        |
| Fecha  | 2026-11-03                                                                                                                                                   |
| Origen | Observación del cliente en QAS: al pulsar editar en una tabla con muchos registros, la fila no se marca y hay que revisar dos veces a quién se está editando |
| Repos  | Frontend (nuestro, rama `feature/filas-seleccionadas` con PR; luego el del cliente)                                                                          |

## Requisitos

- [x] **Fila seleccionada:** al pulsar editar, ver detalle, PDF o activar/desactivar, la fila queda con fondo azul claro y una barra azul a la izquierda mientras el panel o el diálogo estén abiertos.
- [x] **Al pasar el mouse:** resaltado más visible que el actual.
- [x] **Al guardar:** la fila editada (o activada/desactivada) se ilumina unos 2 segundos al volver a la tabla.
- [x] Aplica a Usuarios, Áreas, Sociedades, Roles, Menús, Orden de pago, Documentos (bandejas) y Workflows. Estado de factura no tiene acciones por fila: solo el resaltado al pasar el mouse.

## Fuera de alcance

- Selección múltiple o selección con el teclado.
