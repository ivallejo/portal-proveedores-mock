# Flujo 02 · Registro de documento sin orden de compra

| Campo | Valor |
|---|---|
| Actor | Usuario proveedor o usuario interno |
| Pantalla | Registrar documentos › Sin orden de compra |
| Estado final | Interno: Pendiente de contabilización · Proveedor: Pendiente de aprobación |
| Servicios | SAP 02 (validar documento y duplicidad · SUNAT) |
| Versión | 2026-10-17 (flujo entregado por negocio) |

```mermaid
flowchart TD
    A([Inicio]) --> B[Iniciar sesión<br/>Usuario proveedor o interno]
    B --> C[Ingresar al módulo<br/>Documentos]
    C --> D[Seleccionar tipo de ingreso:<br/>Sin orden de compra]
    D --> E[Seleccionar sociedad]
    E --> F{¿Es usuario interno?}
    F -- No --> G[Seleccionar área] --> H[Seleccionar aprobador] --> I
    F -- Sí --> I[Adjuntar XML<br/>documento electrónico]
    I --> J[Adjuntar PDF]
    J --> K{¿La serie<br/>comienza con E?}
    K -- No --> L[Adjuntar CDR] --> M
    K -- Sí --> M[Adjuntar archivos extras PDF]
    M --> N[Consolidar los PDF<br/>en un solo archivo]
    N --> O[Mostrar detalle del<br/>documento electrónico]
    O --> P[Validar documento y duplicidad<br/>Servicio 02 SAP · SUNAT]
    P --> Q{¿Documento válido<br/>y no duplicado?}
    Q -- No --> R([Fin · Documento no válido])
    Q -- Sí --> S{¿Es usuario interno?}
    S -- Sí --> T[Registrar documento<br/>PENDIENTE DE CONTABILIZACIÓN] --> T1([Fin])
    S -- No --> U[Registrar documento<br/>PENDIENTE DE APROBACIÓN] --> V[Enviar correo<br/>al aprobador] --> V1([Fin])
```

## Reglas

- **Proveedor**: elige área y aprobador; el documento queda en **Pendiente de aprobación** y se envía un correo al aprobador.
- **Usuario interno**: no elige área ni aprobador; el documento queda directo en **Pendiente de contabilización**.
- El **CDR** es obligatorio salvo que la serie empiece con «E».
- Los archivos extras (PDF) se consolidan en un solo archivo.
- Antes de validar en SAP se muestra el **detalle del documento electrónico** leído del XML.
