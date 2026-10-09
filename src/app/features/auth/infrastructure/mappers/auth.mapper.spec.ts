import { toAuthSession } from './auth.mapper';

describe('toAuthSession', () => {
  it('normalizes the backend roles and keeps the session data', () => {
    const session = toAuthSession({
      accessToken: 'jwt',
      expiresAtUtc: '',
      user: {
        username: 'cxp',
        email: 'cxp@ejemplo.test',
        companyName: 'Gestor CxP',
        ruc: '',
        area: null,
        role: 'Gestor de cuentas por pagar',
        roles: ['Gestor de cuentas por pagar', 'ACCOUNTS_PAYABLE', 'desconocido'],
      },
    });
    expect(session.accessToken).toBe('jwt');
    expect(session.user).toEqual({
      username: 'cxp',
      name: 'Gestor CxP',
      email: 'cxp@ejemplo.test',
      emails: ['cxp@ejemplo.test'],
      role: 'CxP',
      roles: ['CxP'],
      providerId: undefined,
      area: undefined,
      mustChangePassword: undefined,
    });
  });

  it('falls back to the provider role when no role is known', () => {
    const session = toAuthSession({
      accessToken: 'jwt',
      expiresAtUtc: '',
      user: { username: '2010', email: '', companyName: 'X', ruc: '20100126606', role: 'otro' },
    });
    expect(session.user.roles).toEqual(['Proveedor']);
    expect(session.user.providerId).toBe('20100126606');
  });
});
