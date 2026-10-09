import { InjectionToken } from '@angular/core';
import { ChangeAreaStatusPort } from '../application/ports/in/change-area-status.port';
import { GetAreaSocietiesPort } from '../application/ports/in/get-area-societies.port';
import { GetAreasPort } from '../application/ports/in/get-areas.port';
import { SaveAreaPort } from '../application/ports/in/save-area.port';
import { AreaRepositoryPort } from '../application/ports/out/area-repository.port';
import { SocietyLookupPort } from '../application/ports/out/society-lookup.port';

export const GET_AREAS = new InjectionToken<GetAreasPort>('GET_AREAS');
export const GET_AREA_SOCIETIES = new InjectionToken<GetAreaSocietiesPort>('GET_AREA_SOCIETIES');
export const SAVE_AREA = new InjectionToken<SaveAreaPort>('SAVE_AREA');
export const CHANGE_AREA_STATUS = new InjectionToken<ChangeAreaStatusPort>('CHANGE_AREA_STATUS');
export const AREA_REPOSITORY = new InjectionToken<AreaRepositoryPort>('AREA_REPOSITORY');
export const SOCIETY_LOOKUP = new InjectionToken<SocietyLookupPort>('SOCIETY_LOOKUP');
