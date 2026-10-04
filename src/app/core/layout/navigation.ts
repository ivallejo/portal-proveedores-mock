import { IconName } from '../../shared/ui/icon/icons';
import { Tone } from '../../shared/ui/tone';
import { Role } from '../../shared/models/models';

export interface ModuleLink {
  label: string;
  path: string;
  /** Ícono del menú lateral. */
  icon: IconName;
  /** Ícono y color de la tarjeta en Inicio. */
  cardIcon: IconName;
  cardTone: Tone;
  description: string;
  roles: Role[];
}

export interface SettingsLink {
  label: string;
  path: string;
}

/** Módulos del portal, en el orden del menú lateral. */
export const MODULES: ModuleLink[] = [
  {
    label: 'Orden de pago',
    path: '/orden-pago',
    icon: 'cash',
    cardIcon: 'cash',
    cardTone: 'purple',
    description:
      'Consulta los pagos realizados a tu empresa, los comprobantes cancelados, retenciones y detracciones.',
    roles: ['Proveedor'],
  },
  {
    label: 'Estado de factura',
    path: '/estado-factura',
    icon: 'file-lines',
    cardIcon: 'receipt',
    cardTone: 'warn',
    description:
      'Sigue cada factura desde que la recibimos hasta su pago: revisión, conformidad, observaciones y fecha programada.',
    roles: ['Proveedor'],
  },
  {
    label: 'Documentos',
    path: '/documentos',
    icon: 'file-text',
    cardIcon: 'folder',
    cardTone: 'teal',
    description:
      'Revisa los documentos sin orden de compra y los documentos especiales asignados para aprobarlos, rechazarlos o reasignarlos.',
    roles: ['Área Usuaria'],
  },
  {
    label: 'Registrar documentos',
    path: '/registrar-documento',
    icon: 'file-upload',
    cardIcon: 'file-upload',
    cardTone: 'orange',
    description:
      'Registra tus facturas con o sin orden de compra y documentos especiales, adjuntando XML, PDF y CDR.',
    roles: ['Proveedor', 'Colaborador interno'],
  },
  {
    label: 'Contabilización',
    path: '/contabilizacion',
    icon: 'chart-bar',
    cardIcon: 'book',
    cardTone: 'success',
    description:
      'Revisa los documentos pendientes de contabilización y recházalos u obsérvalos si algo no está conforme.',
    roles: ['CxP'],
  },
];

/** Submenú «Configuración» (solo administradores). */
export const SETTINGS_LINKS: SettingsLink[] = [
  { label: 'Sociedad', path: '/configuracion/sociedades' },
  { label: 'Área', path: '/configuracion/areas' },
  { label: 'Centro de costo', path: '/configuracion/centros-costo' },
  { label: 'Usuarios y roles', path: '/configuracion/usuarios' },
  { label: 'Workflows de aprobación', path: '/configuracion/workflows' },
  { label: 'Parámetros generales', path: '/configuracion/parametros' },
];
