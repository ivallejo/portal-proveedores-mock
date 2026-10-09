import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GET_ACCESS_TOKEN } from '../../di/auth.tokens';
import { SessionFacade } from '../facades/session.facade';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let session: jasmine.SpyObj<SessionFacade>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    session = jasmine.createSpyObj<SessionFacade>('session', [
      'logout',
      'markPasswordChangeRequired',
    ]);
    router = jasmine.createSpyObj<Router>('router', ['navigate', 'navigateByUrl']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: GET_ACCESS_TOKEN, useValue: { execute: () => 'jwt' } },
        { provide: SessionFacade, useValue: session },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  it('sends the token and closes the session on 401', () => {
    http.get('/api/x').subscribe({ error: () => undefined });
    const request = backend.expectOne('/api/x');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt');
    request.flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(session.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('goes to change the temporary password on 403 PASSWORD_CHANGE_REQUIRED', () => {
    http.get('/api/x').subscribe({ error: () => undefined });
    backend
      .expectOne('/api/x')
      .flush({ code: 'PASSWORD_CHANGE_REQUIRED' }, { status: 403, statusText: 'Forbidden' });
    expect(session.markPasswordChangeRequired).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/contrasena-temporal');
  });
});
