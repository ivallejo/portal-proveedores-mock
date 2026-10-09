import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CatalogFacade } from '../../../catalog';
import { UserFacingError } from '../../../../shared/errors/user-facing-error';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { CHANGE_SOCIETY_STATUS, GET_SOCIETIES, SAVE_SOCIETY } from '../../di/societies.tokens';
import { Society } from '../../domain/models/society';
import { SocietyListFacade } from './society-list.facade';

const naviera: Society = {
  id: '1',
  code: '1001',
  name: 'Naviera Transoceánica',
  ruc: '20522163890',
  billingEmail: 'a@navitranso.com',
  isActive: true,
  areaCount: 5,
  userCount: 6,
};
const petrolera: Society = {
  ...naviera,
  id: '2',
  code: '1002',
  name: 'Petrolera',
  isActive: false,
};

describe('SocietyListFacade', () => {
  let save: jasmine.Spy;
  let reload: jasmine.Spy;

  function setup(): SocietyListFacade {
    save = jasmine.createSpy('save').and.returnValue(of(naviera));
    reload = jasmine.createSpy('reload');
    TestBed.configureTestingModule({
      providers: [
        SocietyListFacade,
        { provide: GET_SOCIETIES, useValue: { execute: () => of([naviera, petrolera]) } },
        { provide: SAVE_SOCIETY, useValue: { execute: save } },
        { provide: CHANGE_SOCIETY_STATUS, useValue: { execute: () => of(naviera) } },
        { provide: CatalogFacade, useValue: { reload } },
        { provide: ToastService, useValue: { show: () => undefined } },
      ],
    });
    const facade = TestBed.inject(SocietyListFacade);
    facade.load();
    return facade;
  }

  it('loads, counts and filters by search and status', () => {
    const facade = setup();
    expect(facade.kpis()).toEqual({ total: '2', active: '1', inactive: '1' });
    facade.setDraft({ search: 'petro', status: 'inactive' });
    facade.search();
    expect(facade.rows().map((society) => society.code)).toEqual(['1002']);
  });

  it('does not save an invalid form', () => {
    const facade = setup();
    facade.openNew();
    facade.setField('code', 'x');
    facade.save();
    expect(save).not.toHaveBeenCalled();
    expect(facade.errors().code).toBe('De 2 a 5 letras o números.');
    expect(facade.saveError()).toBe('Revisa los campos marcados.');
  });

  it('saves an edited society and refreshes the catalog', () => {
    const facade = setup();
    facade.openEdit(naviera);
    facade.setField('name', 'Naviera S.A.');
    facade.save();
    expect(save).toHaveBeenCalledOnceWith('1', jasmine.objectContaining({ name: 'Naviera S.A.' }));
    expect(reload).toHaveBeenCalled();
    expect(facade.editing()).toBeNull();
  });

  it('shows the backend message when saving fails', () => {
    const facade = setup();
    save.and.returnValue(throwError(() => new UserFacingError('El código ya existe.')));
    facade.openEdit(naviera);
    facade.save();
    expect(facade.saveError()).toBe('El código ya existe.');
  });
});
