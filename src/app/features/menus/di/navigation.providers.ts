import { Provider, inject } from '@angular/core';
import { GetNavigationUseCase } from '../application/use-cases/get-navigation.use-case';
import { NavigationHttpAdapter } from '../infrastructure/http/navigation-http.adapter';
import { GET_NAVIGATION, NAVIGATION_QUERY } from './menus.tokens';

/** Menú de la sesión: lo usan el shell y los guards de toda la app, así que va en `app.config.ts`. */
export const NAVIGATION_PROVIDERS: Provider[] = [
  { provide: NAVIGATION_QUERY, useClass: NavigationHttpAdapter },
  { provide: GET_NAVIGATION, useFactory: () => new GetNavigationUseCase(inject(NAVIGATION_QUERY)) },
];
