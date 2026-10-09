import { AuthenticatedUser } from '../models/authenticated-user';
import { hasAnyRole, landingPathFor, normalizeRole } from './role-rules';

const user = (
  roles: AuthenticatedUser['roles'],
  mustChangePassword?: boolean,
): AuthenticatedUser => ({
  username: 'u',
  name: 'U',
  role: roles[0],
  roles,
  mustChangePassword,
});

describe('role rules', () => {
  it('lets the administrator in everywhere and the rest by role', () => {
    expect(hasAnyRole(user(['Administrador']), ['CxP'])).toBeTrue();
    expect(hasAnyRole(user(['CxP']), ['CxP', 'Proveedor'])).toBeTrue();
    expect(hasAnyRole(user(['Proveedor']), ['CxP'])).toBeFalse();
    expect(hasAnyRole(null, undefined)).toBeFalse();
  });

  it('sends each role to its landing page, or to change a temporary password', () => {
    expect(landingPathFor(user(['CxP']))).toBe('/contabilizacion');
    expect(landingPathFor(user(['Área Usuaria', 'CxP']))).toBe('/documentos');
    expect(landingPathFor(user(['Colaborador interno']))).toBe('/registrar-documento');
    expect(landingPathFor(user(['CxP'], true))).toBe('/contrasena-temporal');
    expect(landingPathFor(null)).toBe('/inicio');
  });
});

describe('normalizeRole', () => {
  it('maps backend role names and codes to frontend roles', () => {
    expect(normalizeRole('Aprobador de área')).toBe('Área Usuaria');
    expect(normalizeRole('Gestor de cuentas por pagar')).toBe('CxP');
    expect(normalizeRole('ADMINISTRATOR')).toBe('Administrador');
    expect(normalizeRole('Proveedor')).toBe('Proveedor');
    expect(normalizeRole('desconocido')).toBeNull();
  });
});
