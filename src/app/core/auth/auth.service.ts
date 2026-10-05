import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, User, normalizeRole } from '../../shared/models/models';

const SESSION_KEY = 'portal-proveedores.session';
const TOKEN_KEY = 'web-proveedores.access-token';

/** Pantalla inicial de cada rol, en orden de prioridad. */
const LANDING: [Role, string][] = [
  ['Administrador', '/inicio'],
  ['Proveedor', '/inicio'],
  ['Área Usuaria', '/documentos'],
  ['CxP', '/contabilizacion'],
  ['Colaborador interno', '/registrar-documento'],
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(this.restoreSession());
  readonly isAdmin = computed(() => this.user()?.roles.includes('Administrador') ?? false);

  login(identifier: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { identifier, password })
      .pipe(map((response) => this.startSession(response)));
  }

  requestPasswordReset(ruc: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${environment.apiBaseUrl}/auth/password-reset/request`,
      { ruc },
    );
  }

  confirmPasswordReset(
    ruc: string,
    token: string,
    newPassword: string,
    purpose: 'activation' | 'password-reset',
  ): Observable<void> {
    const endpoint = purpose === 'activation' ? 'activation/confirm' : 'password-reset/confirm';
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/${endpoint}`, {
      ruc,
      token,
      newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    this.user.set(null);
  }

  /** El administrador puede entrar a todo; el resto necesita alguno de los roles. */
  hasAnyRole(roles: readonly Role[] | undefined): boolean {
    const user = this.user();
    if (!user) return false;
    if (!roles?.length || user.roles.includes('Administrador')) return true;
    return roles.some((role) => user.roles.includes(role));
  }

  /** Cambia la contraseña de quien tiene sesión (obligatorio con clave temporal) y renueva la sesión. */
  changePassword(currentPassword: string, newPassword: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/change-password`, {
        currentPassword,
        newPassword,
      })
      .pipe(map((response) => this.startSession(response)));
  }

  /** El backend exigió cambiar la contraseña (403 PASSWORD_CHANGE_REQUIRED): se actualiza la sesión local. */
  markPasswordChangeRequired(): void {
    const current = this.user();
    if (!current || current.mustChangePassword) return;
    const updated = { ...current, mustChangePassword: true };
    this.user.set(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  }

  landingPath(): string {
    if (this.user()?.mustChangePassword) return '/contrasena-temporal';
    const roles = this.user()?.roles ?? [];
    return LANDING.find(([role]) => roles.includes(role))?.[1] ?? '/inicio';
  }

  private startSession(response: AuthResponse): User {
    const names = response.user.roles?.length ? response.user.roles : [response.user.role];
    const roles = Array.from(
      new Set(names.map(normalizeRole).filter((role): role is Role => role !== null)),
    );
    if (!roles.length) roles.push('Proveedor');
    const user: User = {
      username: response.user.username,
      name: response.user.companyName,
      email: response.user.email,
      emails: [response.user.email],
      role: roles[0],
      roles,
      providerId: response.user.ruc || undefined,
      area: response.user.area || undefined,
      mustChangePassword: response.user.mustChangePassword || undefined,
    };
    this.user.set(user);
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  private restoreSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw || !localStorage.getItem(TOKEN_KEY)) return null;
      const user = JSON.parse(raw) as User;
      return Array.isArray(user.roles) && user.roles.length ? user : null;
    } catch {
      return null;
    }
  }
}

interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: {
    username: string;
    email: string;
    companyName: string;
    ruc: string;
    area?: string | null;
    mustChangePassword?: boolean;
    role: string;
    roles?: string[];
  };
}

export interface PasswordResetResponse {
  sent: boolean;
  maskedEmail: string;
}
