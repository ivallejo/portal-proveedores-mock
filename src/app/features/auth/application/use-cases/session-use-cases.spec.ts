import { firstValueFrom, of } from 'rxjs';
import { AuthenticatedUser } from '../../domain/models/authenticated-user';
import { AuthenticationGatewayPort } from '../ports/out/authentication-gateway.port';
import { SessionStorePort } from '../ports/out/session-store.port';
import { LoginUseCase } from './login.use-case';
import { LogoutUseCase } from './logout.use-case';
import { RestoreSessionUseCase } from './restore-session.use-case';

const user: AuthenticatedUser = { username: 'u', name: 'U', role: 'CxP', roles: ['CxP'] };

function store(): jasmine.SpyObj<SessionStorePort> {
  return jasmine.createSpyObj<SessionStorePort>('store', [
    'load',
    'save',
    'saveUser',
    'accessToken',
    'clear',
  ]);
}

describe('session use cases', () => {
  it('login saves the session and notifies the listeners', async () => {
    const gateway = jasmine.createSpyObj<AuthenticationGatewayPort>('gateway', ['login']);
    gateway.login.and.returnValue(of({ accessToken: 'jwt', user }));
    const sessionStore = store();
    const listener = jasmine.createSpyObj('listener', ['sessionChanged']);
    const result = await firstValueFrom(
      new LoginUseCase(gateway, sessionStore, [listener]).execute({
        identifier: 'u',
        password: 'p',
      }),
    );
    expect(result).toEqual(user);
    expect(sessionStore.save).toHaveBeenCalledOnceWith({ accessToken: 'jwt', user });
    expect(listener.sessionChanged).toHaveBeenCalledTimes(1);
  });

  it('logout clears the session and notifies the listeners', () => {
    const sessionStore = store();
    const listener = jasmine.createSpyObj('listener', ['sessionChanged']);
    new LogoutUseCase(sessionStore, [listener]).execute();
    expect(sessionStore.clear).toHaveBeenCalled();
    expect(listener.sessionChanged).toHaveBeenCalled();
  });

  it('ignores a stored session without roles', () => {
    const sessionStore = store();
    sessionStore.load.and.returnValue({ accessToken: 'jwt', user: { ...user, roles: [] } });
    expect(new RestoreSessionUseCase(sessionStore).execute()).toBeNull();
    sessionStore.load.and.returnValue({ accessToken: 'jwt', user });
    expect(new RestoreSessionUseCase(sessionStore).execute()).toEqual(user);
  });
});
