import { Provider, inject } from '@angular/core';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { ConfirmPasswordLinkUseCase } from '../application/use-cases/confirm-password-link.use-case';
import { GetAccessTokenUseCase } from '../application/use-cases/get-access-token.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { LookupProviderUseCase } from '../application/use-cases/lookup-provider.use-case';
import { RequestAccessKeyUseCase } from '../application/use-cases/request-access-key.use-case';
import { RequestPasswordResetUseCase } from '../application/use-cases/request-password-reset.use-case';
import { RestoreSessionUseCase } from '../application/use-cases/restore-session.use-case';
import { UpdateSessionUserUseCase } from '../application/use-cases/update-session-user.use-case';
import { AuthHttpAdapter } from '../infrastructure/http/auth-http.adapter';
import { ProviderDirectoryHttpAdapter } from '../infrastructure/http/provider-directory-http.adapter';
import { BrowserSessionStoreAdapter } from '../infrastructure/session/browser-session-store.adapter';
import {
  AUTHENTICATION_GATEWAY,
  CHANGE_PASSWORD,
  CONFIRM_PASSWORD_LINK,
  GET_ACCESS_TOKEN,
  LOGIN,
  LOGOUT,
  LOOKUP_PROVIDER,
  PROVIDER_DIRECTORY,
  REQUEST_ACCESS_KEY,
  REQUEST_PASSWORD_RESET,
  RESTORE_SESSION,
  SESSION_LISTENERS,
  SESSION_STORE,
  UPDATE_SESSION_USER,
} from './auth.tokens';

const listeners = () => inject(SESSION_LISTENERS, { optional: true }) ?? [];

/** La sesión es de toda la app: estos providers van en `app.config.ts`. */
export const AUTH_PROVIDERS: Provider[] = [
  { provide: AUTHENTICATION_GATEWAY, useClass: AuthHttpAdapter },
  { provide: SESSION_STORE, useClass: BrowserSessionStoreAdapter },
  { provide: PROVIDER_DIRECTORY, useClass: ProviderDirectoryHttpAdapter },
  {
    provide: LOGIN,
    useFactory: () =>
      new LoginUseCase(inject(AUTHENTICATION_GATEWAY), inject(SESSION_STORE), listeners()),
  },
  {
    provide: CHANGE_PASSWORD,
    useFactory: () =>
      new ChangePasswordUseCase(inject(AUTHENTICATION_GATEWAY), inject(SESSION_STORE), listeners()),
  },
  { provide: LOGOUT, useFactory: () => new LogoutUseCase(inject(SESSION_STORE), listeners()) },
  { provide: RESTORE_SESSION, useFactory: () => new RestoreSessionUseCase(inject(SESSION_STORE)) },
  {
    provide: UPDATE_SESSION_USER,
    useFactory: () => new UpdateSessionUserUseCase(inject(SESSION_STORE)),
  },
  { provide: GET_ACCESS_TOKEN, useFactory: () => new GetAccessTokenUseCase(inject(SESSION_STORE)) },
  {
    provide: REQUEST_PASSWORD_RESET,
    useFactory: () => new RequestPasswordResetUseCase(inject(AUTHENTICATION_GATEWAY)),
  },
  {
    provide: CONFIRM_PASSWORD_LINK,
    useFactory: () => new ConfirmPasswordLinkUseCase(inject(AUTHENTICATION_GATEWAY)),
  },
  {
    provide: LOOKUP_PROVIDER,
    useFactory: () => new LookupProviderUseCase(inject(PROVIDER_DIRECTORY)),
  },
  {
    provide: REQUEST_ACCESS_KEY,
    useFactory: () => new RequestAccessKeyUseCase(inject(PROVIDER_DIRECTORY)),
  },
];
