# Flujo 01 · Registro de documento con orden de compra

| Campo        | Valor                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actor        | Usuario proveedor                                                                                                                                                                                                                                 |
| Pantalla     | Registrar documentos › Con orden de compra                                                                                                                                                                                                        |
| Estado final | Pendiente de contabilización                                                                                                                                                                                                                      |
| Servicios    | SAP 01 (validar orden · SERTICA), SAP 02 (validar documento y duplicidad · SUNAT)                                                                                                                                                                 |
| Versión      | 2026-11-19: tipo de entrega en órdenes de servicio y validación de la orden al registrar, según el diseño «Propuesta 4» ([spec 012](../specs/012-registro-propuesta-4/requisitos.md)). Versión anterior: 2026-10-17 (flujo entregado por negocio) |

```mermaid
flowchart TD
    A([Inicio]) --> B[Iniciar sesión<br/>Usuario proveedor]
    B --> C[Ingresar al módulo<br/>Documentos]
    C --> D[Seleccionar tipo de ingreso:<br/>Con orden de compra]
    D --> E[Seleccionar sociedad]
    E --> F{Seleccionar<br/>tipo de orden}
    F -- Bien --> G[Ingresar N° de carrier]
    F -- Servicio --> F2{Tipo de entrega}
    F2 -- Entregado en almacén --> G
    F2 -- Entregado a bordo --> H[Ingresar N° de orden de compra]
    G --> L[Adjuntar XML<br/>documento electrónico]
    H --> L
    L --> M[Adjuntar PDF]
    M --> N{¿La serie del documento<br/>comienza con E?}
    N -- No --> O[Adjuntar CDR] --> P[Continuar]
    N -- Sí --> P
    P --> Q[Adjuntar archivos extras PDF]
    Q --> R[Registrar documento]
    R --> I[Validar orden o carrier<br/>Servicio 01 SAP · SERTICA]
    I --> J{¿Orden válida?}
    J -- No --> K[Mostrar mensaje:<br/>la orden no es válida en SAP<br/>corregir el número y volver a registrar] --> R
    J -- Sí --> T[Validar documento electrónico y duplicidad<br/>Servicio 02 SAP · SUNAT]
    T --> U{¿Documento válido<br/>y no duplicado?}
    U -- No --> V[Mostrar mensaje:<br/>Documento no válido o duplicado] --> V1([Fin])
    U -- Sí --> W[Registrar documento electrónico<br/>consolidando los PDF extras]
    W --> X[Estado:<br/>PENDIENTE DE CONTABILIZACIÓN] --> Y([Fin])
```

## Reglas

- Solo el **usuario proveedor** registra con orden de compra.
- Tipo de orden **Bien** → se ingresa el N° de carrier. **Servicio** → se elige el tipo de entrega: **entregado a bordo** (N° de orden de compra) o **entregado en almacén** (N° de carrier).
- Los archivos se cargan desde el inicio; la orden se valida en SAP (servicio 01) al pulsar «Registrar documento». Si no es válida, no se registra, se conservan los archivos y se pide corregir el número.
- El **CDR** es obligatorio salvo que la serie del documento empiece con «E».
- Los archivos extras (PDF) se consolidan en un solo archivo.
- Al adjuntar el XML se muestra el **detalle del documento electrónico** leído del archivo.
- Válido y no duplicado (servicio 02 + SUNAT) → **Pendiente de contabilización** (no pasa por aprobación).
