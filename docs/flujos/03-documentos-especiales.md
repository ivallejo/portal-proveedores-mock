# Flujo 03 · Registro de documentos especiales

| Campo | Valor |
|---|---|
| Actor | Usuario interno |
| Pantalla | Registrar documentos › Documentos especiales |
| Estado final | Pendiente de contabilización |
| Servicios | SAP 02 (duplicidad); liquidación de cobranzas: SAP 02 + SUNAT |
| Versión | 2026-10-17 (flujo entregado por negocio) |

```mermaid
flowchart TD
    A([Inicio]) --> B[Iniciar sesión<br/>Usuario interno]
    B --> C[Ingresar al módulo<br/>Documentos]
    C --> D[Seleccionar tipo de ingreso:<br/>Documento especial]
    D --> E{Tipo de documento}
    E -- Boleto aéreo --> F[Seleccionar sociedad]
    E -- Recibo público --> F
    E -- No domiciliado --> F
    E -- Liquidación de cobranzas --> F
    F --> G[Ingresar datos del documento:<br/>RUC del proveedor, fecha de emisión,<br/>N° de documento e importe]
    G --> H[Adjuntar archivo PDF]
    H --> I{¿Es liquidación<br/>de cobranzas?}
    I -- No --> J[Validar duplicidad<br/>Servicio 02 SAP]
    I -- Sí --> K[Validar documento y duplicidad<br/>Servicio 02 SAP · SUNAT]
    J --> L{¿Documento válido<br/>y no duplicado?}
    K --> L
    L -- No --> M[Mostrar mensaje:<br/>Documento no válido o duplicado] --> M1([Fin])
    L -- Sí --> N[Registrar documento]
    N --> O[Estado:<br/>PENDIENTE DE CONTABILIZACIÓN] --> P([Fin])
```

## Reglas

- Solo el **usuario interno** registra documentos especiales.
- Tipos: boleto aéreo, recibo público, no domiciliado y liquidación de cobranzas.
- Se ingresan manualmente RUC del proveedor, fecha de emisión, N° de documento e importe, y se adjunta un PDF.
- La **liquidación de cobranzas** se valida en SAP y SUNAT; los demás tipos solo por duplicidad en SAP.
- Válido → **Pendiente de contabilización** (no pasa por aprobación).
