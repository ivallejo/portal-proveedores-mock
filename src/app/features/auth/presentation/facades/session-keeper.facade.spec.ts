import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { GET_ACCESS_TOKEN, RENEW_SESSION } from '../../di/auth.tokens';
import { SessionFacade } from './session.facade';
import { SessionKeeperFacade } from './session-keeper.facade';

const NOW = Date.UTC(2026, 10, 3, 12, 0, 0);
const token = (expiresInMinutes: number) =>
  `x.${btoa(JSON.stringify({ exp: (NOW + expiresInMinutes * 60_000) / 1000 }))}.y`;

describe('SessionKeeperFacade', () => {
  let current: string;
  let renew: jasmine.Spy;
  let session: { user: () => object | null; logout: jasmine.Spy };
  let router: { url: string; navigate: jasmine.Spy };

  function setup(): SessionKeeperFacade {
    renew = jasmine.createSpy('renew').and.returnValue(of(undefined));
    session = { user: () => ({ username: 'ana' }), logout: jasmine.createSpy('logout') };
    router = { url: '/configuracion/usuarios', navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        { provide: GET_ACCESS_TOKEN, useValue: { execute: () => current } },
        { provide: RENEW_SESSION, useValue: { execute: renew } },
        { provide: SessionFacade, useValue: session },
        { provide: Router, useValue: router },
      ],
    });
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(NOW));
    const keeper = TestBed.inject(SessionKeeperFacade);
    keeper.start();
    return keeper;
  }

  afterEach(() => jasmine.clock().uninstall());

  it('no renueva mientras al token le quede tiempo', () => {
    const keeper = setup();
    current = token(20);
    keeper.check(NOW);
    expect(renew).not.toHaveBeenCalled();
  });

  it('renueva antes de vencer si hubo actividad', () => {
    const keeper = setup();
    current = token(4);
    keeper.check(NOW + 60_000);
    expect(renew).toHaveBeenCalledTimes(1);
  });

  it('sin actividad no renueva y, al vencer, cierra por inactividad', () => {
    const keeper = setup();
    current = token(4);
    keeper.check(NOW + 31 * 60_000);
    expect(renew).not.toHaveBeenCalled();
    current = token(-1);
    keeper.check(NOW + 31 * 60_000);
    expect(session.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { sesion: 'inactividad', returnUrl: '/configuracion/usuarios' },
    });
  });

  it('si el token venció con actividad reciente, avisa que la sesión venció', () => {
    const keeper = setup();
    current = token(-1);
    keeper.check(NOW + 60_000);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { sesion: 'vencida', returnUrl: '/configuracion/usuarios' },
    });
  });
});
