import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PasswordResetResult } from '../../application/models/password-reset-result';
import {
  CHANGE_PASSWORD,
  CONFIRM_PASSWORD_LINK,
  LOGIN,
  LOGOUT,
  REQUEST_PASSWORD_RESET,
  RESTORE_SESSION,
  UPDATE_SESSION_USER,
} from '../../di/auth.tokens';
import { AuthenticatedUser } from '../../domain/models/authenticated-user';
import { PasswordLinkAccount } from '../../domain/models/password-link-account';
import { PasswordLinkPurpose } from '../../domain/models/password-link-purpose';
import { Role } from '../../domain/models/role';
import { hasAnyRole, landingPathFor } from '../../domain/rules/role-rules';

/** Sesión de la app: quién ingresó, con qué roles, y las acciones que la abren, cambian o cierran. */
@Injectable({ providedIn: 'root' })
export class SessionFacade {
  private readonly loginPort = inject(LOGIN);
  private readonly logoutPort = inject(LOGOUT);
  private readonly changePasswordPort = inject(CHANGE_PASSWORD);
  private readonly updateUser = inject(UPDATE_SESSION_USER);
  private readonly requestReset = inject(REQUEST_PASSWORD_RESET);
  private readonly confirmLink = inject(CONFIRM_PASSWORD_LINK);

  readonly user = signal<AuthenticatedUser | null>(inject(RESTORE_SESSION).execute());
  readonly isAdmin = computed(() => this.user()?.roles.includes('Administrador') ?? false);

  login(identifier: string, password: string): Observable<AuthenticatedUser> {
    return this.loginPort
      .execute({ identifier, password })
      .pipe(tap((user) => this.user.set(user)));
  }

  /**
   * Cambia la contraseña de quien tiene sesión y renueva la sesión.
   * `currentPassword` se omite en el cambio forzado de la contraseña temporal.
   */
  changePassword(newPassword: string, currentPassword?: string): Observable<AuthenticatedUser> {
    return this.changePasswordPort
      .execute({ newPassword, currentPassword })
      .pipe(tap((user) => this.user.set(user)));
  }

  requestPasswordReset(ruc: string): Observable<PasswordResetResult> {
    return this.requestReset.execute(ruc);
  }

  /** La cuenta del enlace: `ruc` (proveedor) o `user` (personal interno). */
  confirmPasswordReset(
    account: PasswordLinkAccount,
    token: string,
    newPassword: string,
    purpose: PasswordLinkPurpose,
  ): Observable<void> {
    return this.confirmLink.execute({ account, token, newPassword, purpose });
  }

  logout(): void {
    this.logoutPort.execute();
    this.user.set(null);
  }

  hasAnyRole(roles: readonly Role[] | undefined): boolean {
    return hasAnyRole(this.user(), roles);
  }

  landingPath(): string {
    return landingPathFor(this.user());
  }

  /** Mi perfil cambió el nombre o el correo principal: se refleja en el encabezado. */
  updateIdentity(name: string, email: string): void {
    this.user.set(this.updateUser.execute(this.user(), { name, email }));
  }

  /** El backend exigió cambiar la contraseña (403 PASSWORD_CHANGE_REQUIRED): se actualiza la sesión local. */
  markPasswordChangeRequired(): void {
    const current = this.user();
    if (!current || current.mustChangePassword) return;
    this.user.set(this.updateUser.execute(current, { mustChangePassword: true }));
  }
}
