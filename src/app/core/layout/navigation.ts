import { IconName } from '../../shared/ui/icon/icon-name';
import { Tone } from '../../shared/ui/tone/tone';
import { FeatureFlag } from '../config/feature-flag';
import { FeatureFlags } from '../config/feature-flags';
import { isFeatureEnabled } from '../config/is-feature-enabled';

export interface ModuleLink {
  label: string;
  path: string;
  /** Ícono del menú lateral. */
  icon: IconName;
  /** Ícono y color de la tarjeta en Inicio. */
  cardIcon: IconName;
  cardTone: Tone;
  description: string;
  /** Funcionalidad que habilita el módulo; apagada, el menú lo marca «Pronto». */
  feature: FeatureFlag;
}

export interface SettingsLink {
  label: string;
  path: string;
  feature?: FeatureFlag;
}

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

/** Pantallas de Configuración y su feature flag. */
export const SETTINGS_LINKS: SettingsLink[] = [
  { label: 'Sociedades', path: '/configuracion/sociedades', feature: 'sociedades' },
  { label: 'Áreas', path: '/configuracion/areas', feature: 'areas' },
  { label: 'Usuarios', path: '/configuracion/usuarios', feature: 'usuarios' },
  { label: 'Roles y permisos', path: '/configuracion/roles', feature: 'roles' },
  { label: 'Menús', path: '/configuracion/menus', feature: 'menus' },
];

/**
 * Si la pantalla de la ruta está publicada (su feature flag está encendido). Las rutas sin pantalla en el portal
 * (opciones creadas en Configuración › Menús) se muestran como «Pronto».
 */
export function isRouteLive(flags: FeatureFlags, route: string | null): boolean {
  if (route === '/inicio') return true;
  const link = [...MODULES, ...SETTINGS_LINKS].find((item) => item.path === route);
  return link ? isLinkLive(flags, link) : false;
}

/** Si la funcionalidad del enlace está habilitada; sin `feature` (opciones de Configuración sin pantalla) nunca lo está. */
export function isLinkLive(flags: FeatureFlags, link: { feature?: FeatureFlag }): boolean {
  return link.feature ? isFeatureEnabled(flags, link.feature) : false;
}
