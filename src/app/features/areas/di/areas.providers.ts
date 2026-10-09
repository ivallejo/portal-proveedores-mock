import { Provider, inject } from '@angular/core';
import { SOCIETIES_PROVIDERS } from '../../societies';
import { ChangeAreaStatusUseCase } from '../application/use-cases/change-area-status.use-case';
import { GetAreaSocietiesUseCase } from '../application/use-cases/get-area-societies.use-case';
import { GetAreasUseCase } from '../application/use-cases/get-areas.use-case';
import { SaveAreaUseCase } from '../application/use-cases/save-area.use-case';
import { AreaHttpAdapter } from '../infrastructure/http/area-http.adapter';
import { SocietyLookupAdapter } from '../infrastructure/societies/society-lookup.adapter';
import {
  AREA_REPOSITORY,
  CHANGE_AREA_STATUS,
  GET_AREAS,
  GET_AREA_SOCIETIES,
  SAVE_AREA,
  SOCIETY_LOOKUP,
} from './areas.tokens';

/** Enlaza cada puerto con su caso de uso y sus adaptadores (HTTP y la feature societies). */
export const AREAS_PROVIDERS: Provider[] = [
  ...SOCIETIES_PROVIDERS,
  { provide: AREA_REPOSITORY, useClass: AreaHttpAdapter },
  { provide: SOCIETY_LOOKUP, useClass: SocietyLookupAdapter },
  { provide: GET_AREAS, useFactory: () => new GetAreasUseCase(inject(AREA_REPOSITORY)) },
  {
    provide: GET_AREA_SOCIETIES,
    useFactory: () => new GetAreaSocietiesUseCase(inject(SOCIETY_LOOKUP)),
  },
  { provide: SAVE_AREA, useFactory: () => new SaveAreaUseCase(inject(AREA_REPOSITORY)) },
  {
    provide: CHANGE_AREA_STATUS,
    useFactory: () => new ChangeAreaStatusUseCase(inject(AREA_REPOSITORY)),
  },
];
