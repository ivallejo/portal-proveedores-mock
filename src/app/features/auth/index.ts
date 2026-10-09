// API pública de la feature auth: lo único que otras features pueden importar.
export type { AuthenticatedUser } from './domain/models/authenticated-user';
export type { Role } from './domain/models/role';
export { normalizeRole, roleLabel } from './domain/rules/role-rules';
export type { PasswordRule } from './domain/models/password-rule';
export { passwordRules } from './domain/rules/password-rules';
export type { SessionListenerPort } from './application/ports/out/session-listener.port';
export { SESSION_LISTENERS } from './di/auth.tokens';
export { AUTH_PROVIDERS } from './di/auth.providers';
export { SessionFacade } from './presentation/facades/session.facade';
export { authGuard } from './presentation/guards/auth.guard';
export { roleGuard } from './presentation/guards/role.guard';
export { rootRedirectGuard } from './presentation/guards/root-redirect.guard';
export { authInterceptor } from './presentation/interceptors/auth.interceptor';
export { AUTH_ROUTES } from './auth.routes';
