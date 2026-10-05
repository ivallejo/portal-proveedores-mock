import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

/** Códigos de rol del backend (`SecurityCatalog`). */
export type RoleCode =
  'PROVIDER' | 'INTERNAL_USER' | 'AREA_APPROVER' | 'ACCOUNTS_PAYABLE' | 'ADMINISTRATOR';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  ruc: string | null;
  areaId: string | null;
  areaName: string | null;
  roles: RoleCode[];
  companyCodes: string[];
  isActive: boolean;
  isLocked: boolean;
  mustChangePassword: boolean;
  createdAtUtc: string;
}

export interface AdminUserPage {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminCatalog {
  roles: { code: RoleCode; name: string }[];
  areas: { id: string; name: string }[];
  companies: { code: string; name: string }[];
}

/** Datos de acceso comunes a crear y editar. */
export interface UserAccess {
  email: string;
  name: string;
  roles: RoleCode[];
  areaId: string | null;
  companyCodes: string[];
}

export interface NewUser extends UserAccess {
  username: string;
  ruc: string | null;
  password: string;
}

/** Administración de usuarios contra `api/admin/users`. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/admin/users`;

  search(search: string, page: number, pageSize: number): Observable<AdminUserPage> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search.trim()) params = params.set('search', search.trim());
    return this.http.get<AdminUserPage>(this.base, { params });
  }

  catalog(): Observable<AdminCatalog> {
    return this.http.get<AdminCatalog>(`${this.base}/catalog`);
  }

  create(user: NewUser): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.base, user);
  }

  update(id: string, access: UserAccess): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.base}/${id}`, access);
  }

  setStatus(id: string, isActive: boolean): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.base}/${id}/status`, { isActive });
  }

  unlock(id: string): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.base}/${id}/unlock`, {});
  }
}
