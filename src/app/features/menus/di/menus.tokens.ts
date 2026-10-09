import { InjectionToken } from '@angular/core';
import { ChangeMenuStatusPort } from '../application/ports/in/change-menu-status.port';
import { GetMenusPort } from '../application/ports/in/get-menus.port';
import { GetNavigationPort } from '../application/ports/in/get-navigation.port';
import { SaveMenuPort } from '../application/ports/in/save-menu.port';
import { MenuRepositoryPort } from '../application/ports/out/menu-repository.port';
import { NavigationQueryPort } from '../application/ports/out/navigation-query.port';

export const GET_NAVIGATION = new InjectionToken<GetNavigationPort>('GET_NAVIGATION');
export const GET_MENUS = new InjectionToken<GetMenusPort>('GET_MENUS');
export const SAVE_MENU = new InjectionToken<SaveMenuPort>('SAVE_MENU');
export const CHANGE_MENU_STATUS = new InjectionToken<ChangeMenuStatusPort>('CHANGE_MENU_STATUS');
export const NAVIGATION_QUERY = new InjectionToken<NavigationQueryPort>('NAVIGATION_QUERY');
export const MENU_REPOSITORY = new InjectionToken<MenuRepositoryPort>('MENU_REPOSITORY');
