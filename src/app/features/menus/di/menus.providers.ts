import { Provider, inject } from '@angular/core';
import { ChangeMenuStatusUseCase } from '../application/use-cases/change-menu-status.use-case';
import { GetMenusUseCase } from '../application/use-cases/get-menus.use-case';
import { SaveMenuUseCase } from '../application/use-cases/save-menu.use-case';
import { MenuHttpAdapter } from '../infrastructure/http/menu-http.adapter';
import { CHANGE_MENU_STATUS, GET_MENUS, MENU_REPOSITORY, SAVE_MENU } from './menus.tokens';

/** Configuración › Menús (y las features que necesitan la lista de opciones, como Roles y permisos). */
export const MENUS_PROVIDERS: Provider[] = [
  { provide: MENU_REPOSITORY, useClass: MenuHttpAdapter },
  { provide: GET_MENUS, useFactory: () => new GetMenusUseCase(inject(MENU_REPOSITORY)) },
  { provide: SAVE_MENU, useFactory: () => new SaveMenuUseCase(inject(MENU_REPOSITORY)) },
  {
    provide: CHANGE_MENU_STATUS,
    useFactory: () => new ChangeMenuStatusUseCase(inject(MENU_REPOSITORY)),
  },
];
