import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, User } from '../../shared/models/models';
import { MockUsersStore } from '../../shared/state/mock-users.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(MockUsersStore);
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(null);

  constructor() {
    const activationLink = new URLSearchParams(window.location.search).get('activationToken');
    if (activationLink) {
      localStorage.removeItem('portal-proveedores.mock-session');
      localStorage.removeItem('web-proveedores.access-token');
      return;
    }
    const session = localStorage.getItem('portal-proveedores.mock-session');
    if (session) {
      try {
        this.user.set(JSON.parse(session) as User);
      } catch {
        localStorage.removeItem('portal-proveedores.mock-session');
      }
    }
  }

  login(identifier: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, { identifier, password })
      .pipe(map((response) => this.startSession(response)));
  }
  register(data: {
    ruc: string;
    email: string;
    company: string;
    password: string;
  }): Observable<User> {
    const userRecord = {
      id: `mock-user-${Date.now()}`,
      username: data.ruc,
      email: data.email,
      emails: [data.email],
      companyName: data.company,
      area: '',
      ruc: data.ruc,
      password: data.password,
      role: 'Proveedor' as Role,
      roles: ['Proveedor'] as Role[],
      isActive: true,
      createdAtUtc: new Date().toISOString(),
    };
    this.users.save(userRecord);
    return of(this.toUser(userRecord)).pipe(delay(450));
  }
  requestPasswordReset(ruc: string): Observable<PasswordResetResponse> {
    return this.http.post<PasswordResetResponse>(
      `${environment.apiBaseUrl}/auth/password-reset/request`,
      { ruc },
    );
  }
  confirmPasswordReset(ruc: string, token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/password-reset/confirm`, {
      ruc,
      token,
      newPassword,
    });
  }
  logout(): void {
    localStorage.removeItem('portal-proveedores.mock-session');
    localStorage.removeItem('web-proveedores.access-token');
    this.clearActivationLink();
    this.user.set(null);
  }
  clearActivationLink(): void {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('activationToken') && !url.searchParams.has('ruc')) return;
    url.search = '';
    window.history.replaceState({}, document.title, url.pathname + url.hash);
  }
  updatePassword(identifier: string, password: string): void {
    const record = this.users.findByIdentifier(identifier);
    if (record) this.users.update(record.id, { password });
  }
  setActiveRole(role: Role): void {
    const current = this.user();
    if (!current || !current.roles.includes(role)) return;
    const updated = { ...current, role };
    this.user.set(updated);
    localStorage.setItem('portal-proveedores.mock-session', JSON.stringify(updated));
  }
  private toUser(user: {
    username: string;
    email: string;
    emails?: string[];
    companyName: string;
    ruc: string;
    role: Role;
    roles: Role[];
  }): User {
    return {
      username: user.username,
      name: user.companyName,
      email: user.email,
      emails: user.emails?.length ? user.emails : [user.email],
      role: user.role,
      roles: user.roles,
      providerId: user.ruc,
    };
  }

  private startSession(response: AuthResponse): User {
    const user = this.toUser({
      username: response.user.username,
      email: response.user.email,
      companyName: response.user.companyName,
      ruc: response.user.ruc,
      role: response.user.role as Role,
      roles: (response.user.roles?.length ? response.user.roles : [response.user.role]) as Role[],
    });
    this.user.set(user);
    localStorage.setItem('web-proveedores.access-token', response.accessToken);
    localStorage.setItem('portal-proveedores.mock-session', JSON.stringify(user));
    return user;
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
    role: string;
    roles?: string[];
  };
}

export interface PasswordResetResponse {
  sent: boolean;
  maskedEmail: string;
}
