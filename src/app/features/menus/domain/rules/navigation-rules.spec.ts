import { allowsPath, routesOf } from './navigation-rules';

describe('navigation rules', () => {
  const items = [
    { code: 'HOME', name: 'Inicio', route: '/inicio', icon: 'home', children: [] },
    {
      code: 'SETTINGS',
      name: 'Configuración',
      route: null,
      icon: 'settings',
      children: [
        {
          code: 'SETTINGS_USERS',
          name: 'Usuarios',
          route: '/configuracion/usuarios',
          icon: 'users',
          children: [],
        },
      ],
    },
  ];

  it('collects the routes of the options and their submenus', () => {
    expect([...routesOf(items)]).toEqual(['/inicio', '/configuracion/usuarios']);
  });

  it('allows a route and its subroutes, nothing else', () => {
    const routes = routesOf(items);
    expect(allowsPath(routes, '/configuracion/usuarios')).toBeTrue();
    expect(allowsPath(routes, '/configuracion/usuarios/123')).toBeTrue();
    expect(allowsPath(routes, '/configuracion/usuarios-x')).toBeFalse();
    expect(allowsPath(routes, '/configuracion/roles')).toBeFalse();
  });
});
