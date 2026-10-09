import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CatalogService } from '../../../../shared/data/catalog.service';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import {
  CHANGE_AREA_STATUS,
  GET_AREAS,
  GET_AREA_SOCIETIES,
  SAVE_AREA,
} from '../../di/areas.tokens';
import { Area } from '../../domain/models/area';
import { AreaSociety } from '../../domain/models/area-society';
import { AreaListFacade } from './area-list.facade';

const compras: Area = {
  id: 'a1',
  name: 'Compras',
  description: null,
  societyId: 's1',
  societyCode: '1001',
  societyName: 'Naviera',
  isActive: true,
  userCount: 0,
};
const finanzas: Area = {
  ...compras,
  id: 'a2',
  name: 'Finanzas',
  societyId: 's2',
  societyName: 'Petral',
};
const naviera: AreaSociety = { id: 's1', code: '1001', name: 'Naviera', ruc: null, isActive: true };
const petral: AreaSociety = { id: 's2', code: '1003', name: 'Petral', ruc: null, isActive: false };

describe('AreaListFacade', () => {
  let save: jasmine.Spy;

  function setup(): AreaListFacade {
    save = jasmine.createSpy('save').and.returnValue(of(compras));
    TestBed.configureTestingModule({
      providers: [
        AreaListFacade,
        { provide: GET_AREAS, useValue: { execute: () => of([compras, finanzas]) } },
        { provide: GET_AREA_SOCIETIES, useValue: { execute: () => of([naviera, petral]) } },
        { provide: SAVE_AREA, useValue: { execute: save } },
        { provide: CHANGE_AREA_STATUS, useValue: { execute: () => of(compras) } },
        { provide: CatalogService, useValue: { reload: () => undefined } },
        { provide: ToastService, useValue: { show: () => undefined } },
      ],
    });
    const facade = TestBed.inject(AreaListFacade);
    facade.load();
    facade.loadSocieties();
    return facade;
  }

  it('filters the areas by society', () => {
    const facade = setup();
    facade.setDraft({ societyId: 's2' });
    facade.search();
    expect(facade.rows().map((area) => area.name)).toEqual(['Finanzas']);
  });

  it('offers only active societies, plus the current one of the area being edited', () => {
    const facade = setup();
    facade.openNew();
    expect(facade.societyFormOptions().map((option) => option.value)).toEqual(['s1']);
    facade.openEdit(finanzas);
    expect(facade.societyFormOptions().map((option) => option.value)).toEqual(['s1', 's2']);
  });

  it('requires the society and the name before saving', () => {
    const facade = setup();
    facade.openNew();
    facade.save();
    expect(save).not.toHaveBeenCalled();
    expect(facade.errors()).toEqual({
      societyId: 'Selecciona la sociedad.',
      name: 'Ingresa el nombre del área.',
    });
  });
});
