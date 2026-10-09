import { FeatureFlag } from './feature-flag';
import { FeatureFlags } from './feature-flags';

export function isFeatureEnabled(flags: FeatureFlags, feature: FeatureFlag): boolean {
  return flags[feature];
}
