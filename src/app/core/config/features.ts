import { environment } from '../../../environments/environment';

/**
 * Funcionalidades habilitables por entorno (`environment.features`).
 * Una funcionalidad apagada sigue en el menú, pero su pantalla muestra «en construcción».
 * Para publicarla, ponerla en `true` en `environment.production.ts`.
 */
export type FeatureFlag = keyof typeof environment.features;

export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return environment.features[feature];
}
