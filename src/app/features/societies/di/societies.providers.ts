import { Provider, inject } from '@angular/core';
import { ChangeSocietyStatusUseCase } from '../application/use-cases/change-society-status.use-case';
import { GetSocietiesUseCase } from '../application/use-cases/get-societies.use-case';
import { SaveSocietyUseCase } from '../application/use-cases/save-society.use-case';
import { SocietyHttpAdapter } from '../infrastructure/http/society-http.adapter';
import {
  CHANGE_SOCIETY_STATUS,
  GET_SOCIETIES,
  SAVE_SOCIETY,
  SOCIETY_REPOSITORY,
} from './societies.tokens';

/** Enlaza cada puerto con su caso de uso y el repositorio con el adaptador HTTP. */
export const SOCIETIES_PROVIDERS: Provider[] = [
  { provide: SOCIETY_REPOSITORY, useClass: SocietyHttpAdapter },
  { provide: GET_SOCIETIES, useFactory: () => new GetSocietiesUseCase(inject(SOCIETY_REPOSITORY)) },
  { provide: SAVE_SOCIETY, useFactory: () => new SaveSocietyUseCase(inject(SOCIETY_REPOSITORY)) },
  {
    provide: CHANGE_SOCIETY_STATUS,
    useFactory: () => new ChangeSocietyStatusUseCase(inject(SOCIETY_REPOSITORY)),
  },
];
