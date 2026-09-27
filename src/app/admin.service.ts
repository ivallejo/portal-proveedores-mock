import { Injectable, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';
import { Role } from './models';
import { MockUsersStore } from './mock-users.store';

export interface AdminUser {
  id: string;
  username: string;
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
    username: string;
    email: string;
    companyName: string;
    ruc: string;
    password: string;
    roles?: Role[];
  }): Observable<AdminUser> {
    const duplicate = this.users
      .users()
      .some((user) => user.username === data.username || user.ruc === data.ruc);
    if (duplicate)
      return throwError(() => ({ error: { message: 'El username o RUC ya está registrado.' } }));
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
  update(
    id: string,
    data: { username: string; email: string; companyName: string; ruc: string; roles: Role[] },
  ): Observable<AdminUser> {
    const user = this.users.update(id, {
      username: data.username,
      email: data.email,
      companyName: data.companyName,
      ruc: data.ruc,
      role: data.roles[0],
      roles: data.roles,
    });
    return user
      ? of(this.toAdminUser(user)).pipe(delay(350))
      : throwError(() => ({ error: { message: 'Usuario no encontrado.' } }));
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
      username: user.username,
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
