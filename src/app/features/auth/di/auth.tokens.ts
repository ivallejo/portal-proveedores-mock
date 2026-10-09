import { InjectionToken } from '@angular/core';
import { ChangePasswordPort } from '../application/ports/in/change-password.port';
import { ConfirmPasswordLinkPort } from '../application/ports/in/confirm-password-link.port';
import { GetAccessTokenPort } from '../application/ports/in/get-access-token.port';
import { LoginPort } from '../application/ports/in/login.port';
import { LogoutPort } from '../application/ports/in/logout.port';
import { LookupProviderPort } from '../application/ports/in/lookup-provider.port';
import { RequestAccessKeyPort } from '../application/ports/in/request-access-key.port';
import { RequestPasswordResetPort } from '../application/ports/in/request-password-reset.port';
import { RestoreSessionPort } from '../application/ports/in/restore-session.port';
import { UpdateSessionUserPort } from '../application/ports/in/update-session-user.port';
import { AuthenticationGatewayPort } from '../application/ports/out/authentication-gateway.port';
import { ProviderDirectoryPort } from '../application/ports/out/provider-directory.port';
import { SessionListenerPort } from '../application/ports/out/session-listener.port';
import { SessionStorePort } from '../application/ports/out/session-store.port';

// Puertos de entrada.
export const LOGIN = new InjectionToken<LoginPort>('LOGIN');
export const LOGOUT = new InjectionToken<LogoutPort>('LOGOUT');
export const CHANGE_PASSWORD = new InjectionToken<ChangePasswordPort>('CHANGE_PASSWORD');
export const RESTORE_SESSION = new InjectionToken<RestoreSessionPort>('RESTORE_SESSION');
export const UPDATE_SESSION_USER = new InjectionToken<UpdateSessionUserPort>('UPDATE_SESSION_USER');
export const GET_ACCESS_TOKEN = new InjectionToken<GetAccessTokenPort>('GET_ACCESS_TOKEN');
export const REQUEST_PASSWORD_RESET = new InjectionToken<RequestPasswordResetPort>(
  'REQUEST_PASSWORD_RESET',
);
export const CONFIRM_PASSWORD_LINK = new InjectionToken<ConfirmPasswordLinkPort>(
  'CONFIRM_PASSWORD_LINK',
);
export const LOOKUP_PROVIDER = new InjectionToken<LookupProviderPort>('LOOKUP_PROVIDER');
export const REQUEST_ACCESS_KEY = new InjectionToken<RequestAccessKeyPort>('REQUEST_ACCESS_KEY');

// Puertos de salida.
export const AUTHENTICATION_GATEWAY = new InjectionToken<AuthenticationGatewayPort>(
  'AUTHENTICATION_GATEWAY',
);
export const SESSION_STORE = new InjectionToken<SessionStorePort>('SESSION_STORE');
export const PROVIDER_DIRECTORY = new InjectionToken<ProviderDirectoryPort>('PROVIDER_DIRECTORY');
/** Interesados en los cambios de sesión (`multi: true`), registrados en la composición de la app. */
export const SESSION_LISTENERS = new InjectionToken<SessionListenerPort[]>('SESSION_LISTENERS');
