# Portal de Proveedores - Frontend Mock

Frontend Angular independiente para demostrar el Portal de Proveedores de Naviera Transoceánica S.A., con datos mock en memoria y flujos completos de registro, aprobación y contabilización.

## Ejecutar localmente

```bash
npm install
npm start
```

Abrir `http://localhost:4200`.

## Accesos demo

Todos usan la contraseña `1234`:

- `proveedor`: registro y consulta de documentos.
- `area`: aprobación o rechazo de documentos.
- `cxp`: contabilización por SAP o Sertica.

## Alcance

- Validación mock de duplicidad, SUNAT y Sertica.
- Historial de estados por documento.
- Escalamiento automático de aprobaciones.
- Incidencias y reintentos de contabilización.
- Sin backend real ni endpoints externos.
