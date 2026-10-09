import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { environment } from '../environments/environment';
import { API_BASE_URL } from './core/config/api-base-url.token';
import { MenuService } from './core/layout/menu.service';
import { AUTH_PROVIDERS, SESSION_LISTENERS, authInterceptor } from './features/auth';
import { FEATURE_FLAGS } from './core/config/feature-flags.token';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    { provide: FEATURE_FLAGS, useValue: environment.features },
    AUTH_PROVIDERS,
    // El menú se vuelve a cargar cuando cambia la sesión (auth no conoce al menú).
    {
      provide: SESSION_LISTENERS,
      multi: true,
      useFactory: () => {
        const menu = inject(MenuService);
        return { sessionChanged: () => menu.reset() };
      },
    },
  ],
};
