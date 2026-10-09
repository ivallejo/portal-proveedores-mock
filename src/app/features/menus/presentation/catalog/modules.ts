import { ModuleLink } from './module-link';

/** Pantallas del portal: tarjeta de Inicio y feature flag. Quién las ve lo define el menú del backend. */
export const MODULES: ModuleLink[] = [
  {
    label: 'Orden de pago',
    path: '/orden-pago',
    icon: 'cash',
    cardIcon: 'cash',
    cardTone: 'purple',
    description:
      'Consulta los pagos realizados a tu empresa, los comprobantes cancelados, retenciones y detracciones.',
    feature: 'ordenPago',
  },
  {
    label: 'Estado de factura',
    path: '/estado-factura',
    icon: 'file-lines',
    cardIcon: 'receipt',
    cardTone: 'warn',
    description:
      'Sigue cada factura desde que la recibimos hasta su pago: revisión, conformidad, observaciones y fecha programada.',
    feature: 'estadoFactura',
  },
  {
    label: 'Documentos',
    path: '/documentos',
    icon: 'file-text',
    cardIcon: 'folder',
    cardTone: 'teal',
    description:
      'Revisa los documentos sin orden de compra y los documentos especiales asignados para aprobarlos, rechazarlos o reasignarlos.',
    feature: 'documentos',
  },
  {
    label: 'Registrar documentos',
    path: '/registrar-documento',
    icon: 'file-upload',
    cardIcon: 'file-upload',
    cardTone: 'orange',
    description:
      'Registra tus facturas con o sin orden de compra y documentos especiales, adjuntando XML, PDF y CDR.',
    feature: 'registrarDocumento',
  },
  {
    label: 'Contabilización',
    path: '/contabilizacion',
    icon: 'chart-bar',
    cardIcon: 'book',
    cardTone: 'success',
    description:
      'Revisa los documentos pendientes de contabilización y recházalos u obsérvalos si algo no está conforme.',
    feature: 'contabilizacion',
  },
];
