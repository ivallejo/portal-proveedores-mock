import { FeatureFlag } from '../../../../core/config/feature-flag';

export interface SettingsLink {
  label: string;
  path: string;
  feature?: FeatureFlag;
}
