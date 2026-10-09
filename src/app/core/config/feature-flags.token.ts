import { InjectionToken } from '@angular/core';
import { FeatureFlags } from './feature-flags';

/** Funcionalidades encendidas en este entorno (`environment.features`), provistas en `app.config.ts`. */
export const FEATURE_FLAGS = new InjectionToken<FeatureFlags>('FEATURE_FLAGS');
