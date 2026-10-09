import { Provider, inject } from '@angular/core';
import { ChangeUserStatusUseCase } from '../application/use-cases/change-user-status.use-case';
import { GetPasswordLinksUseCase } from '../application/use-cases/get-password-links.use-case';
import { GetUserCatalogUseCase } from '../application/use-cases/get-user-catalog.use-case';
import { GetUserUseCase } from '../application/use-cases/get-user.use-case';
import { SaveUserUseCase } from '../application/use-cases/save-user.use-case';
import { SearchUsersUseCase } from '../application/use-cases/search-users.use-case';
import { SendPasswordLinkUseCase } from '../application/use-cases/send-password-link.use-case';
import { PasswordLinkHttpAdapter } from '../infrastructure/http/password-link-http.adapter';
import { UserCatalogHttpAdapter } from '../infrastructure/http/user-catalog-http.adapter';
import { UserHttpAdapter } from '../infrastructure/http/user-http.adapter';
import {
  CHANGE_USER_STATUS,
  GET_PASSWORD_LINKS,
  GET_USER,
  GET_USER_CATALOG,
  PASSWORD_LINK_GATEWAY,
  SAVE_USER,
  SEARCH_USERS,
  SEND_PASSWORD_LINK,
  USER_CATALOG_QUERY,
  USER_REPOSITORY,
} from './users.tokens';

/** Enlaza cada puerto con su caso de uso y sus adaptadores HTTP. */
export const USERS_PROVIDERS: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserHttpAdapter },
  { provide: USER_CATALOG_QUERY, useClass: UserCatalogHttpAdapter },
  { provide: PASSWORD_LINK_GATEWAY, useClass: PasswordLinkHttpAdapter },
  { provide: SEARCH_USERS, useFactory: () => new SearchUsersUseCase(inject(USER_REPOSITORY)) },
  { provide: GET_USER, useFactory: () => new GetUserUseCase(inject(USER_REPOSITORY)) },
  { provide: SAVE_USER, useFactory: () => new SaveUserUseCase(inject(USER_REPOSITORY)) },
  {
    provide: CHANGE_USER_STATUS,
    useFactory: () => new ChangeUserStatusUseCase(inject(USER_REPOSITORY)),
  },
  {
    provide: GET_USER_CATALOG,
    useFactory: () => new GetUserCatalogUseCase(inject(USER_CATALOG_QUERY)),
  },
  {
    provide: SEND_PASSWORD_LINK,
    useFactory: () => new SendPasswordLinkUseCase(inject(PASSWORD_LINK_GATEWAY)),
  },
  {
    provide: GET_PASSWORD_LINKS,
    useFactory: () => new GetPasswordLinksUseCase(inject(PASSWORD_LINK_GATEWAY)),
  },
];
