import { BrowserSessionStoreAdapter } from './browser-session-store.adapter';

describe('BrowserSessionStoreAdapter', () => {
  const store = new BrowserSessionStoreAdapter();
  const user = { username: 'u', name: 'U', role: 'CxP' as const, roles: ['CxP' as const] };

  afterEach(() => store.clear());

  it('keeps the same localStorage keys as before', () => {
    store.save({ accessToken: 'jwt', user });
    expect(localStorage.getItem('web-proveedores.access-token')).toBe('jwt');
    expect(JSON.parse(localStorage.getItem('portal-proveedores.session')!)).toEqual(user);
    expect(store.load()).toEqual({ accessToken: 'jwt', user });
  });

  it('has no session without the token or with broken data', () => {
    localStorage.setItem('portal-proveedores.session', JSON.stringify(user));
    expect(store.load()).toBeNull();
    localStorage.setItem('web-proveedores.access-token', 'jwt');
    localStorage.setItem('portal-proveedores.session', '{roto');
    expect(store.load()).toBeNull();
  });
});
