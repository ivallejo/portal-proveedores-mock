import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EmailType } from '../../profile/profile.service';

export type UserStatus = 'active' | 'inactive' | 'locked';

export interface UserSummary {
  id: string;
  displayName: string;
  primaryEmail: string;
  isProvider: boolean;
  document: string;
  documentType: 'RUC' | 'DNI' | 'Usuario';
  role: string | null;
  roleName: string | null;
  areaName: string | null;
  companyCodes: string[];
  status: UserStatus;
  isActivated: boolean;
}

export interface UserEmail {
  id: string | null;
  email: string;
  type: EmailType;
  isPrimary: boolean;
  isVerified: boolean;
  createdAtUtc: string | null;
}

export interface UserDetail {
  id: string;
  username: string;
  isProvider: boolean;
  document: string;
  documentType: 'RUC' | 'DNI' | 'Usuario';
  displayName: string;
  businessName: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  areaId: string | null;
  companyCodes: string[];
  emails: UserEmail[];
  status: UserStatus;
  isActivated: boolean;
  mustChangePassword: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface UserPage {
  items: UserSummary[];
  total: number;
  page: number;
  pageSize: number;
  counts: { total: number; active: number; blockedOrInactive: number };
}

export interface UserCatalog {
  roles: {
    code: string;
    name: string;
    description: string | null;
    isProvider: boolean;
    isActive: boolean;
  }[];
  areas: {
    id: string;
    name: string;
    companyCode: string;
    companyName: string;
    isActive: boolean;
  }[];
  companies: { code: string; name: string; ruc: string | null; isActive: boolean }[];
}

export interface SaveUserInput {
  role: string;
  document?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  areaId: string | null;
  companyCodes: string[];
  emails: { id?: string; email: string; type: EmailType; isPrimary: boolean }[];
  status: UserStatus;
  mustChangePassword: boolean;
}

export interface PasswordLink {
  kind: 'activation' | 'reset';
  fingerprint: string;
  createdAtUtc: string;
  expiresAtUtc: string;
  status: 'valid' | 'used' | 'replaced' | 'expired';
}

export interface UserFilter {
  search: string;
  role: string;
  status: '' | UserStatus;
}

/** Configuración › Usuarios (api/admin/users). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/admin/users`;

  search(filter: UserFilter, page: number, pageSize: number): Observable<UserPage> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filter.search.trim()) params = params.set('search', filter.search.trim());
    if (filter.role) params = params.set('role', filter.role);
    if (filter.status) params = params.set('status', filter.status);
    return this.http.get<UserPage>(this.base, { params });
  }

  catalog(): Observable<UserCatalog> {
    return this.http.get<UserCatalog>(`${this.base}/catalog`);
  }

  get(id: string): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.base}/${id}`);
  }

  save(id: string | null, input: SaveUserInput): Observable<UserDetail> {
    return id
      ? this.http.put<UserDetail>(`${this.base}/${id}`, input)
      : this.http.post<UserDetail>(this.base, input);
  }

  setStatus(id: string, isActive: boolean): Observable<UserDetail> {
    return this.http.patch<UserDetail>(`${this.base}/${id}/status`, { isActive });
  }

  sendPasswordLink(id: string): Observable<{ kind: 'activation' | 'reset'; email: string }> {
    return this.http.post<{ kind: 'activation' | 'reset'; email: string }>(
      `${this.base}/${id}/password-link`,
      {},
    );
  }

  passwordLinks(id: string): Observable<PasswordLink[]> {
    return this.http.get<PasswordLink[]>(`${this.base}/${id}/password-links`);
  }
}
