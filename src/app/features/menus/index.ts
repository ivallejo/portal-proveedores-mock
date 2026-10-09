// API pública de la feature menus: lo único que otras features pueden importar.
export type { NavigationItem } from './domain/models/navigation-item';
export type { MenuOption } from './domain/models/menu-option';
export type { GetMenusPort } from './application/ports/in/get-menus.port';
export { GET_MENUS } from './di/menus.tokens';
export { MENUS_PROVIDERS } from './di/menus.providers';
export { NAVIGATION_PROVIDERS } from './di/navigation.providers';
export { SessionMenuFacade } from './presentation/facades/session-menu.facade';
export { menuGuard } from './presentation/guards/menu.guard';
export type { ModuleLink } from './presentation/catalog/module-link';
export { MODULES } from './presentation/catalog/modules';
export { isLinkLive, isRouteLive } from './presentation/catalog/route-live.util';
export { menuIcon } from './presentation/catalog/menu-icon.util';
export { MENUS_ROUTES } from './menus.routes';
