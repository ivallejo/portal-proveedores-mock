import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { GET_NAVIGATION } from '../../di/menus.tokens';
import { SessionMenuFacade } from './session-menu.facade';

describe('SessionMenuFacade', () => {
  const items = [{ code: 'HOME', name: 'Inicio', route: '/inicio', icon: 'home', children: [] }];
  let execute: jasmine.Spy;

  function setup(): SessionMenuFacade {
    TestBed.configureTestingModule({
      providers: [{ provide: GET_NAVIGATION, useValue: { execute } }],
    });
    return TestBed.inject(SessionMenuFacade);
  }

  it('loads the menu once per session and again after reset', async () => {
    execute = jasmine.createSpy('execute').and.returnValue(of(items));
    const facade = setup();
    expect(await facade.allows('/inicio')).toBeTrue();
    expect(await facade.allows('/configuracion')).toBeFalse();
    expect(execute).toHaveBeenCalledTimes(1);
    facade.reset();
    expect(facade.items()).toBeNull();
    await facade.allows('/inicio');
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('leaves the menu empty if it cannot be loaded', async () => {
    execute = jasmine.createSpy('execute').and.returnValue(throwError(() => new Error('sin red')));
    const facade = setup();
    expect(await facade.allows('/inicio')).toBeFalse();
    expect(facade.items()).toEqual([]);
  });
});
