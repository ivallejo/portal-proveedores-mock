import { IconName } from '../../shared/ui/icon/icons';
import { Tone } from '../../shared/ui/tone';
import { Role } from '../../shared/models/models';
import { FeatureFlag, isFeatureEnabled } from '../config/features';

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
  /** Funcionalidad que habilita el módulo; apagada, el menú lo marca «Pronto». */
  feature: FeatureFlag;
}

export interface SettingsLink {
  label: string;
  path: string;
  feature?: FeatureFlag;
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
    roles: ['Proveedor', 'CxP'],
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
    roles: ['Proveedor', 'CxP'],
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
    roles: ['Área Usuaria'],
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
    roles: ['Proveedor', 'Colaborador interno'],
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
    roles: ['CxP'],
    feature: 'contabilizacion',
  },
];

/** Submenú «Configuración» (solo administradores). */
export const SETTINGS_LINKS: SettingsLink[] = [
  { label: 'Sociedades', path: '/configuracion/sociedades', feature: 'sociedades' },
  { label: 'Áreas', path: '/configuracion/areas', feature: 'areas' },
  { label: 'Usuarios', path: '/configuracion/usuarios', feature: 'usuarios' },
  { label: 'Roles y permisos', path: '/configuracion/roles' },
  { label: 'Menús', path: '/configuracion/menus' },
];

/** Si la funcionalidad del enlace está habilitada; sin `feature` (opciones de Configuración sin pantalla) nunca lo está. */
export function isLinkLive(link: { feature?: FeatureFlag }): boolean {
  return link.feature ? isFeatureEnabled(link.feature) : false;
}
