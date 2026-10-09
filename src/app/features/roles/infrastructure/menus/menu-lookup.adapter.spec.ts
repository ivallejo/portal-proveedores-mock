import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { GET_MENUS, MenuOption } from '../../../menus';
import { MenuLookupAdapter } from './menu-lookup.adapter';

describe('MenuLookupAdapter', () => {
  it('keeps only what Roles needs from the menus feature', async () => {
    const menu: MenuOption = {
      id: 'm1',
      code: 'HOME',
      name: 'Inicio',
      route: '/inicio',
      icon: 'home',
      order: 1,
      parentId: null,
      isActive: true,
      isSystem: true,
      roleCount: 5,
    };
    TestBed.configureTestingModule({
      providers: [
        MenuLookupAdapter,
        { provide: GET_MENUS, useValue: { execute: () => of([menu]) } },
      ],
    });
    expect(await firstValueFrom(TestBed.inject(MenuLookupAdapter).list())).toEqual([
      {
        id: 'm1',
        code: 'HOME',
        name: 'Inicio',
        route: '/inicio',
        icon: 'home',
        parentId: null,
        isActive: true,
      },
    ]);
  });
});
