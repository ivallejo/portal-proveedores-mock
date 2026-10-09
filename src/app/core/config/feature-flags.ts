import type { environment } from '../../../environments/environment';

/**
 * Funcionalidades habilitables por entorno (`environment.features`).
 * Una funcionalidad apagada sigue en el menú, pero su pantalla muestra «en construcción».
 * Para publicarla, ponerla en `true` en `environment.production.ts`.
 */
export type FeatureFlags = Readonly<typeof environment.features>;
