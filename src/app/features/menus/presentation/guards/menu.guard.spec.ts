import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { SessionMenuFacade } from '../facades/session-menu.facade';
import { menuGuard } from './menu.guard';

describe('menuGuard', () => {
  const run = (allowed: boolean, url: string) => {
    TestBed.configureTestingModule({
      providers: [{ provide: SessionMenuFacade, useValue: { allows: async () => allowed } }],
    });
    return TestBed.runInInjectionContext(() =>
      menuGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    ) as Promise<boolean | UrlTree>;
  };

  it('lets the user in when the route is in their menu', async () => {
    expect(await run(true, '/orden-pago?x=1')).toBeTrue();
  });

  it('sends the user to Inicio when the route is not in their menu', async () => {
    const result = await run(false, '/orden-pago');
    expect(result).toEqual(TestBed.inject(Router).parseUrl('/inicio'));
  });
});
