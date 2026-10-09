import { InjectionToken } from '@angular/core';
import { ChangeUserStatusPort } from '../application/ports/in/change-user-status.port';
import { GetPasswordLinksPort } from '../application/ports/in/get-password-links.port';
import { GetUserCatalogPort } from '../application/ports/in/get-user-catalog.port';
import { GetUserPort } from '../application/ports/in/get-user.port';
import { SaveUserPort } from '../application/ports/in/save-user.port';
import { SearchUsersPort } from '../application/ports/in/search-users.port';
import { SendPasswordLinkPort } from '../application/ports/in/send-password-link.port';
import { PasswordLinkGatewayPort } from '../application/ports/out/password-link-gateway.port';
import { UserCatalogQueryPort } from '../application/ports/out/user-catalog-query.port';
import { UserRepositoryPort } from '../application/ports/out/user-repository.port';

export const SEARCH_USERS = new InjectionToken<SearchUsersPort>('SEARCH_USERS');
export const GET_USER_CATALOG = new InjectionToken<GetUserCatalogPort>('GET_USER_CATALOG');
export const GET_USER = new InjectionToken<GetUserPort>('GET_USER');
export const SAVE_USER = new InjectionToken<SaveUserPort>('SAVE_USER');
export const CHANGE_USER_STATUS = new InjectionToken<ChangeUserStatusPort>('CHANGE_USER_STATUS');
export const SEND_PASSWORD_LINK = new InjectionToken<SendPasswordLinkPort>('SEND_PASSWORD_LINK');
export const GET_PASSWORD_LINKS = new InjectionToken<GetPasswordLinksPort>('GET_PASSWORD_LINKS');
export const USER_REPOSITORY = new InjectionToken<UserRepositoryPort>('USER_REPOSITORY');
export const USER_CATALOG_QUERY = new InjectionToken<UserCatalogQueryPort>('USER_CATALOG_QUERY');
export const PASSWORD_LINK_GATEWAY = new InjectionToken<PasswordLinkGatewayPort>(
  'PASSWORD_LINK_GATEWAY',
);
