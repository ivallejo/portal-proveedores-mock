# Flujo 04 · Aprobaciones

| Campo | Valor |
|---|---|
| Actor | Usuario interno (aprobador de área) |
| Pantalla | Documentos (bandeja de aprobación) |
| Estado de entrada | Pendiente de aprobación |
| Versión | 2026-10-17 (flujo entregado por negocio) |

```mermaid
flowchart TD
    A([Inicio]) --> B[Iniciar sesión<br/>Usuario interno]
    B --> C[Ingresar al módulo<br/>Aprobaciones]
    C --> D[Seleccionar documento electrónico<br/>Estado: PENDIENTE DE APROBACIÓN]
    D --> E[Mostrar detalle del<br/>documento electrónico]
    E --> F{¿Qué acción realizar?}
    F -- Aprobar --> G[Aprobar documento electrónico]
    G --> H[Actualizar estado: APROBADO]
    H --> I[Ingresar N° de pedido<br/>o N° de viaje]
    I --> J[Enviar a contabilización]
    J --> K[Estado:<br/>PENDIENTE DE CONTABILIZACIÓN] --> K1([Fin])
    F -- Rechazar --> L[Rechazar documento electrónico]
    L --> M[Ingresar motivo del rechazo]
    M --> N[Enviar correo notificando<br/>el rechazo y el motivo] --> N1([Fin])
    F -- Reasignar --> O[Seleccionar área]
    O --> P[Seleccionar nuevo aprobador]
    P --> Q[Ingresar motivo de reasignación]
    Q --> R[Enviar correo al nuevo aprobador]
    R --> S[Notificar documento<br/>pendiente de aprobación]
    S --> T[Estado:<br/>PENDIENTE DE APROBACIÓN]
    T --> C
```

## Reglas

- **Aprobar**: exige el N° de pedido o de viaje; el documento pasa a **Pendiente de contabilización**.
- **Rechazar**: exige motivo; se envía un correo con el rechazo y el motivo.
- **Reasignar**: exige área, nuevo aprobador y motivo; se envía un correo al nuevo aprobador y el documento sigue en **Pendiente de aprobación**.
