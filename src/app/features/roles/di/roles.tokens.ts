import { InjectionToken } from '@angular/core';
import { ChangeRoleStatusPort } from '../application/ports/in/change-role-status.port';
import { GetPermissionOptionsPort } from '../application/ports/in/get-permission-options.port';
import { GetRolesPort } from '../application/ports/in/get-roles.port';
import { SaveRolePort } from '../application/ports/in/save-role.port';
import { MenuLookupPort } from '../application/ports/out/menu-lookup.port';
import { RoleRepositoryPort } from '../application/ports/out/role-repository.port';

export const GET_ROLES = new InjectionToken<GetRolesPort>('GET_ROLES');
export const GET_PERMISSION_OPTIONS = new InjectionToken<GetPermissionOptionsPort>(
  'GET_PERMISSION_OPTIONS',
);
export const SAVE_ROLE = new InjectionToken<SaveRolePort>('SAVE_ROLE');
export const CHANGE_ROLE_STATUS = new InjectionToken<ChangeRoleStatusPort>('CHANGE_ROLE_STATUS');
export const ROLE_REPOSITORY = new InjectionToken<RoleRepositoryPort>('ROLE_REPOSITORY');
export const MENU_LOOKUP = new InjectionToken<MenuLookupPort>('MENU_LOOKUP');
