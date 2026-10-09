import { FeatureFlag } from '../../../../core/config/feature-flag';
import { FeatureFlags } from '../../../../core/config/feature-flags';
import { isFeatureEnabled } from '../../../../core/config/is-feature-enabled';
import { SETTINGS_LINKS } from './settings-links';
import { MODULES } from './modules';

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
