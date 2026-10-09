import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';

export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  userCount: number;
  menuIds: string[];
}

export interface RoleInput {
  name: string;
  description: string;
  menuIds: string[];
}

export interface MenuItem {
  id: string;
  code: string;
  name: string;
  route: string | null;
  icon: string;
  order: number;
  parentId: string | null;
  isActive: boolean;
  isSystem: boolean;
  roleCount: number;
}

/** Configuración › Roles y permisos (api/admin/roles) y las opciones del menú que se le asignan. */
@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly base = `${this.apiBaseUrl}/admin`;

  roles(): Observable<RoleItem[]> {
    return this.http.get<RoleItem[]>(`${this.base}/roles`);
  }

  saveRole(id: string | null, input: RoleInput): Observable<RoleItem> {
    return id
      ? this.http.put<RoleItem>(`${this.base}/roles/${id}`, input)
      : this.http.post<RoleItem>(`${this.base}/roles`, input);
  }

  setRoleStatus(id: string, isActive: boolean): Observable<RoleItem> {
    return this.http.patch<RoleItem>(`${this.base}/roles/${id}/status`, { isActive });
  }

  /** Opciones del menú para el árbol de permisos (pasa a la API pública de menus en el paso 8). */
  menus(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.base}/menus`);
  }
}
