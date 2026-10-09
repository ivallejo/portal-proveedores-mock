import { FeatureFlags } from '../../../../core/config/feature-flags';
import { isRouteLive } from './route-live.util';

describe('isRouteLive', () => {
  const flags = (enabled: boolean) =>
    new Proxy({} as FeatureFlags, { get: () => enabled }) as FeatureFlags;

  it('uses the feature flag of the screen', () => {
    expect(isRouteLive(flags(true), '/configuracion/sociedades')).toBeTrue();
    expect(isRouteLive(flags(false), '/configuracion/sociedades')).toBeFalse();
  });

  it('always shows Inicio and never routes without a screen', () => {
    expect(isRouteLive(flags(false), '/inicio')).toBeTrue();
    expect(isRouteLive(flags(true), '/ruta-sin-pantalla')).toBeFalse();
  });
});
