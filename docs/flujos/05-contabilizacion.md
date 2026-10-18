# Flujo 05 · Contabilización

| Campo | Valor |
|---|---|
| Actor | Usuario interno (Cuentas por pagar) |
| Pantalla | Contabilización |
| Estado de entrada | Pendiente de contabilización |
| Versión | 2026-10-17 (flujo entregado por negocio) |

```mermaid
flowchart TD
    A([Inicio]) --> B[Iniciar sesión<br/>Usuario interno]
    B --> C[Ingresar al módulo<br/>de contabilización]
    C --> D[Seleccionar un documento]
    D --> E[Mostrar detalle del documento]
    E --> F{¿El documento está en estado<br/>PENDIENTE DE CONTABILIZACIÓN?}
    F -- No --> Z([Fin del flujo])
    F -- Sí --> G{¿Qué acción<br/>desea realizar?}
    G -- Rechazar --> H[Ingresar motivo de rechazo]
    H --> I[Enviar correo al proveedor<br/>indicando el motivo] --> Z
    G -- Observar --> J[Ingresar el correo destinatario]
    J --> K[Ingresar el motivo de observación]
    K --> L[Enviar correo al usuario interno<br/>con el motivo y los documentos adjuntos] --> Z
```

## Reglas

- Solo se actúa sobre documentos en **Pendiente de contabilización**; los demás se consultan.
- **Rechazar**: exige motivo; se envía un correo al proveedor con el motivo.
- **Observar**: exige correo destinatario y motivo; se envía un correo a ese usuario interno con el motivo **y los documentos adjuntos** (XML, PDF, CDR y extras).
- El paso a **Contabilizado** (servicio 03 de SAP) no forma parte de este flujo.
