import { InjectionToken } from '@angular/core';
import { ChangeSocietyStatusPort } from '../application/ports/in/change-society-status.port';
import { GetSocietiesPort } from '../application/ports/in/get-societies.port';
import { SaveSocietyPort } from '../application/ports/in/save-society.port';
import { SocietyRepositoryPort } from '../application/ports/out/society-repository.port';

export const GET_SOCIETIES = new InjectionToken<GetSocietiesPort>('GET_SOCIETIES');
export const SAVE_SOCIETY = new InjectionToken<SaveSocietyPort>('SAVE_SOCIETY');
export const CHANGE_SOCIETY_STATUS = new InjectionToken<ChangeSocietyStatusPort>(
  'CHANGE_SOCIETY_STATUS',
);
export const SOCIETY_REPOSITORY = new InjectionToken<SocietyRepositoryPort>('SOCIETY_REPOSITORY');
