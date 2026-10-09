import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SessionFacade } from '../../../auth';
import { GET_CATALOG_AREAS, GET_CATALOG_COMPANIES } from '../../di/catalog.tokens';
import { CatalogFacade } from './catalog.facade';

describe('CatalogFacade', () => {
  let user: { username: string } | null;
  let companies: jasmine.Spy;

  function setup(): CatalogFacade {
    user = { username: 'ana' };
    companies = jasmine
      .createSpy('companies')
      .and.returnValue(of([{ code: '1001', name: 'Naviera', ruc: null, billingEmail: null }]));
    TestBed.configureTestingModule({
      providers: [
        { provide: SessionFacade, useValue: { user: () => user } },
        { provide: GET_CATALOG_COMPANIES, useValue: { execute: companies } },
        { provide: GET_CATALOG_AREAS, useValue: { execute: () => of([]) } },
      ],
    });
    return TestBed.inject(CatalogFacade);
  }

  it('carga una vez por usuario y arma las opciones de sociedad', () => {
    const catalog = setup();
    catalog.load();
    catalog.load();
    expect(companies).toHaveBeenCalledTimes(1);
    expect(catalog.companyOptions()).toEqual([
      { value: '1001', label: 'Naviera', sub: 'Código 1001' },
    ]);
    user = { username: 'luis' };
    catalog.load();
    expect(companies).toHaveBeenCalledTimes(2);
  });

  it('marca el error y permite reintentar', () => {
    const catalog = setup();
    companies.and.returnValue(throwError(() => new Error('x')));
    catalog.load();
    expect(catalog.loadError()).toBeTrue();
    companies.and.returnValue(of([]));
    catalog.load();
    expect(companies).toHaveBeenCalledTimes(2);
    expect(catalog.loadError()).toBeFalse();
  });
});
