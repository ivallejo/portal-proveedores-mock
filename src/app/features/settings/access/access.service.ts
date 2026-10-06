import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IconName } from '../../../shared/ui/icon/icons';

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

export interface MenuInput {
  name: string;
  route: string | null;
  icon: string;
  order: number;
  parentId: string | null;
}

/** Configuración › Roles y permisos y Menús (api/admin/roles|menus). */
@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/admin`;

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

  /** Lista plana: cada menú principal seguido de sus submenús. */
  menus(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.base}/menus`);
  }

  saveMenu(id: string | null, input: MenuInput): Observable<MenuItem> {
    return id
      ? this.http.put<MenuItem>(`${this.base}/menus/${id}`, input)
      : this.http.post<MenuItem>(`${this.base}/menus`, input);
  }

  setMenuStatus(id: string, isActive: boolean): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.base}/menus/${id}/status`, { isActive });
  }
}

/** Íconos que se pueden elegir para una opción del menú. */
export const MENU_ICONS: { value: IconName; label: string }[] = [
  { value: 'home', label: 'Inicio (casa)' },
  { value: 'cash', label: 'Billetera' },
  { value: 'receipt', label: 'Comprobante' },
  { value: 'file-lines', label: 'Factura' },
  { value: 'file-text', label: 'Documentos' },
  { value: 'file-upload', label: 'Carga de archivo' },
  { value: 'folder', label: 'Carpeta' },
  { value: 'chart-bar', label: 'Gráfico' },
  { value: 'book', label: 'Libro' },
  { value: 'bank', label: 'Banco' },
  { value: 'clipboard', label: 'Portapapeles' },
  { value: 'calendar', label: 'Calendario' },
  { value: 'settings', label: 'Engranaje' },
  { value: 'building', label: 'Edificio' },
  { value: 'layers', label: 'Capas' },
  { value: 'users', label: 'Usuarios' },
  { value: 'shield-check', label: 'Escudo' },
  { value: 'menu', label: 'Lista' },
  { value: 'workflow', label: 'Flujo' },
  { value: 'bell', label: 'Campana' },
];
