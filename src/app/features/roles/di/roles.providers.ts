import { Provider, inject } from '@angular/core';
import { MENUS_PROVIDERS } from '../../menus';
import { ChangeRoleStatusUseCase } from '../application/use-cases/change-role-status.use-case';
import { GetPermissionOptionsUseCase } from '../application/use-cases/get-permission-options.use-case';
import { GetRolesUseCase } from '../application/use-cases/get-roles.use-case';
import { SaveRoleUseCase } from '../application/use-cases/save-role.use-case';
import { RoleHttpAdapter } from '../infrastructure/http/role-http.adapter';
import { MenuLookupAdapter } from '../infrastructure/menus/menu-lookup.adapter';
import {
  CHANGE_ROLE_STATUS,
  GET_PERMISSION_OPTIONS,
  GET_ROLES,
  MENU_LOOKUP,
  ROLE_REPOSITORY,
  SAVE_ROLE,
} from './roles.tokens';

/** Enlaza cada puerto con su caso de uso y sus adaptadores (HTTP y la feature menus). */
export const ROLES_PROVIDERS: Provider[] = [
  ...MENUS_PROVIDERS,
  { provide: ROLE_REPOSITORY, useClass: RoleHttpAdapter },
  { provide: MENU_LOOKUP, useClass: MenuLookupAdapter },
  { provide: GET_ROLES, useFactory: () => new GetRolesUseCase(inject(ROLE_REPOSITORY)) },
  {
    provide: GET_PERMISSION_OPTIONS,
    useFactory: () => new GetPermissionOptionsUseCase(inject(MENU_LOOKUP)),
  },
  { provide: SAVE_ROLE, useFactory: () => new SaveRoleUseCase(inject(ROLE_REPOSITORY)) },
  {
    provide: CHANGE_ROLE_STATUS,
    useFactory: () => new ChangeRoleStatusUseCase(inject(ROLE_REPOSITORY)),
  },
];
