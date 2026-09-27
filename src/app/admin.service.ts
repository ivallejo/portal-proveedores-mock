import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Role } from './models';
import { MockUsersStore } from './mock-users.store';

export interface AdminUser {
  id: string;
  email: string;
  companyName: string;
  ruc: string;
  role: Role;
  roles: Role[];
  isActive: boolean;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly users = inject(MockUsersStore);
  list(): Observable<AdminUser[]> {
    return of(this.users.users().map((user) => this.toAdminUser(user))).pipe(delay(350));
  }
  create(data: {
    email: string;
    companyName: string;
    ruc: string;
    password: string;
    roles?: Role[];
  }): Observable<AdminUser> {
    const duplicate = this.users
      .users()
      .some((user) => user.email === data.email || user.ruc === data.ruc);
    if (duplicate)
      return throwError(() => ({ error: { message: 'El correo o RUC ya está registrado.' } }));
    const roles = data.roles?.length ? data.roles : ['Proveedor' as Role];
    const user = {
      id: `mock-user-${Date.now()}`,
      ...data,
      password: data.password,
      role: roles[0],
      roles,
      isActive: true,
      createdAtUtc: new Date().toISOString(),
    };
    this.users.save(user);
    return of(this.toAdminUser(user)).pipe(delay(350));
  }
  assignRoles(id: string, roles: Role[]): Observable<AdminUser> {
    const user = this.users.update(id, { role: roles[0], roles });
    return user
      ? of(this.toAdminUser(user)).pipe(delay(250))
      : throwError(() => ({ error: { message: 'Usuario no encontrado.' } }));
  }
  assignRole(id: string, role: string): Observable<AdminUser> {
    return this.assignRoles(id, [role as Role]);
  }
  setStatus(id: string, isActive: boolean): Observable<AdminUser> {
    const user = this.users.update(id, { isActive });
    return user
      ? of(this.toAdminUser(user)).pipe(delay(250))
      : throwError(() => ({ error: { message: 'Usuario no encontrado.' } }));
  }
  private toAdminUser(user: ReturnType<MockUsersStore['findById']> & object): AdminUser {
    return {
      id: user.id,
      email: user.email,
      companyName: user.companyName,
      ruc: user.ruc,
      role: user.role,
      roles: user.roles?.length ? user.roles : [user.role],
      isActive: user.isActive,
      createdAtUtc: user.createdAtUtc,
    };
  }
}
