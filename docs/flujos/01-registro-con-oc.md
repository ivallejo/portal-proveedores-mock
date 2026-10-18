# Flujo 01 · Registro de documento con orden de compra

| Campo | Valor |
|---|---|
| Actor | Usuario proveedor |
| Pantalla | Registrar documentos › Con orden de compra |
| Estado final | Pendiente de contabilización |
| Servicios | SAP 01 (validar orden · SERTICA), SAP 02 (validar documento y duplicidad · SUNAT) |
| Versión | 2026-10-17 (flujo entregado por negocio) |

```mermaid
flowchart TD
    A([Inicio]) --> B[Iniciar sesión<br/>Usuario proveedor]
    B --> C[Ingresar al módulo<br/>Documentos]
    C --> D[Seleccionar tipo de ingreso:<br/>Con orden de compra]
    D --> E[Seleccionar sociedad]
    E --> F{Seleccionar<br/>tipo de orden}
    F -- Bien --> G[Ingresar N° de carrier]
    F -- Servicio --> H[Ingresar N° de orden de compra]
    G --> I[Validar tipo de orden<br/>Servicio 01 SAP · SERTICA]
    H --> I
    I --> J{¿Orden válida?}
    J -- No --> K[Mostrar mensaje:<br/>Orden no válida] --> K1([Fin])
    J -- Sí --> L[Adjuntar XML<br/>documento electrónico]
    L --> M[Adjuntar PDF]
    M --> N{¿La serie del documento<br/>comienza con E?}
    N -- No --> O[Adjuntar CDR] --> P[Continuar]
    N -- Sí --> P
    P --> Q[Adjuntar archivos extras PDF]
    Q --> R[Consolidar los PDF<br/>en un solo archivo]
    R --> S[Mostrar detalle del<br/>documento electrónico]
    S --> T[Validar documento electrónico y duplicidad<br/>Servicio 02 SAP · SUNAT]
    T --> U{¿Documento válido<br/>y no duplicado?}
    U -- No --> V[Mostrar mensaje:<br/>Documento no válido o duplicado] --> V1([Fin])
    U -- Sí --> W[Registrar documento electrónico]
    W --> X[Estado:<br/>PENDIENTE DE CONTABILIZACIÓN] --> Y([Fin])
```

## Reglas

- Solo el **usuario proveedor** registra con orden de compra.
- Tipo de orden **Bien** → se ingresa el N° de carrier; **Servicio** → el N° de orden de compra.
- Los archivos se habilitan solo con la orden validada en SAP (servicio 01).
- El **CDR** es obligatorio salvo que la serie del documento empiece con «E».
- Los archivos extras (PDF) se consolidan en un solo archivo.
- Antes de validar en SAP se muestra el **detalle del documento electrónico** leído del XML.
- Válido y no duplicado (servicio 02 + SUNAT) → **Pendiente de contabilización** (no pasa por aprobación).
