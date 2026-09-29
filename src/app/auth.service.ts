import { Injectable, inject, signal } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Role, User } from './models';
import { MockUsersStore } from './mock-users.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(MockUsersStore);
  readonly user = signal<User | null>(null);

  constructor() {
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
    const record = this.users.findByIdentifier(identifier);
    if (!record || !record.isActive || record.password !== password)
      return throwError(() => new Error('RUC, usuario o contraseña inválidos.')).pipe(delay(450));
    const user = this.toUser(record);
    this.user.set(user);
    localStorage.setItem('portal-proveedores.mock-session', JSON.stringify(user));
    return of(user).pipe(delay(450));
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
  logout(): void {
    localStorage.removeItem('portal-proveedores.mock-session');
    this.user.set(null);
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
    companyName: string;
    ruc: string;
    role: Role;
    roles: Role[];
  }): User {
    return {
      username: user.username,
      name: user.companyName,
      role: user.role,
      roles: user.roles,
      providerId: user.ruc,
    };
  }
}
