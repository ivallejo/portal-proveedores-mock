export type Role = 'Proveedor' | 'Colaborador interno' | 'Área Usuaria' | 'CxP' | 'Administrador';

export function roleLabel(role: Role | string): string {
  return (
    {
      Proveedor: 'Proveedor externo',
      'Colaborador interno': 'Usuario interno',
      'Área Usuaria': 'Aprobador de área',
      CxP: 'Gestor de cuentas por pagar',
      Administrador: 'Administrador del portal',
    }[role] || role
  );
}

/**
 * El backend devuelve el nombre del rol del catálogo de seguridad
 * («Aprobador de área», «Gestor de cuentas por pagar»…) o su código
 * («AREA_APPROVER»…). El frontend trabaja con los nombres cortos de `Role`.
 */
export function normalizeRole(value: string): Role | null {
  const key = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const map: Record<string, Role> = {
    proveedor: 'Proveedor',
    'proveedor externo': 'Proveedor',
    provider: 'Proveedor',
    'colaborador interno': 'Colaborador interno',
    'usuario interno': 'Colaborador interno',
    internal_user: 'Colaborador interno',
    'area usuaria': 'Área Usuaria',
    'aprobador de area': 'Área Usuaria',
    area_approver: 'Área Usuaria',
    cxp: 'CxP',
    'gestor de cuentas por pagar': 'CxP',
    accounts_payable: 'CxP',
    administrador: 'Administrador',
    'administrador del portal': 'Administrador',
    administrator: 'Administrador',
  };
  return map[key] ?? null;
}

export interface User {
  username: string;
  name: string;
  email?: string;
  emails?: string[];
  /** Rol principal (el primero de la lista). */
  role: Role;
  roles: Role[];
  providerId?: string;
  area?: string;
  /** La contraseña actual es temporal: debe cambiarla antes de usar el portal. */
  mustChangePassword?: boolean;
}
