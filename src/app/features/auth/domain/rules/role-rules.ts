import { AuthenticatedUser } from '../models/authenticated-user';
import { Role } from '../models/role';

/** Pantalla inicial de cada rol, en orden de prioridad. */
const LANDING: [Role, string][] = [
  ['Administrador', '/inicio'],
  ['Proveedor', '/inicio'],
  ['Área Usuaria', '/documentos'],
  ['CxP', '/contabilizacion'],
  ['Colaborador interno', '/registrar-documento'],
];

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
  const key = value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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

/** El administrador puede entrar a todo; el resto necesita alguno de los roles. */
export function hasAnyRole(
  user: AuthenticatedUser | null,
  roles: readonly Role[] | undefined,
): boolean {
  if (!user) return false;
  if (!roles?.length || user.roles.includes('Administrador')) return true;
  return roles.some((role) => user.roles.includes(role));
}

/** Con contraseña temporal solo se puede ir a cambiarla; si no, a la pantalla inicial del rol. */
export function landingPathFor(user: AuthenticatedUser | null): string {
  if (user?.mustChangePassword) return '/contrasena-temporal';
  const roles = user?.roles ?? [];
  return LANDING.find(([role]) => roles.includes(role))?.[1] ?? '/inicio';
}
