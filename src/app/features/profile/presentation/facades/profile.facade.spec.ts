import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserFacingError } from '../../../../shared/errors/user-facing-error';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { SessionFacade } from '../../../auth';
import {
  ADD_PROFILE_EMAIL,
  GET_PROFILE,
  MAKE_PRIMARY_EMAIL,
  REMOVE_PROFILE_EMAIL,
  RESEND_EMAIL_VERIFICATION,
  UPDATE_PROFILE,
} from '../../di/profile.tokens';
import { Profile } from '../../domain/models/profile';
import { ProfileFacade } from './profile.facade';

const profile: Profile = {
  username: 'prueba.admin',
  isProvider: false,
  ruc: null,
  displayName: 'Ana Pérez',
  businessName: null,
  firstName: 'Ana',
  lastName: 'Pérez',
  roles: ['Administrador'],
  areaName: null,
  areaCompanyName: null,
  companies: [],
  emails: [
    {
      id: 'e1',
      email: 'ana@b.pe',
      type: 'work',
      isPrimary: true,
      isVerified: true,
      createdAtUtc: '2026-01-01T00:00:00',
    },
  ],
  mustChangePassword: false,
  createdAtUtc: '2026-01-01T00:00:00',
  updatedAtUtc: '2026-01-02T00:00:00',
  passwordSetAtUtc: null,
};

describe('ProfileFacade', () => {
  let session: jasmine.SpyObj<SessionFacade>;
  let update: jasmine.Spy;
  let addEmail: jasmine.Spy;

  function setup(mustChangePassword = false): ProfileFacade {
    session = jasmine.createSpyObj<SessionFacade>('SessionFacade', [
      'user',
      'updateIdentity',
      'changePassword',
    ]);
    session.user.and.returnValue({ mustChangePassword } as ReturnType<SessionFacade['user']>);
    update = jasmine
      .createSpy('update')
      .and.callFake((command) => of({ ...profile, ...command, displayName: 'Ana Ruiz' }));
    addEmail = jasmine.createSpy('addEmail');
    TestBed.configureTestingModule({
      providers: [
        ProfileFacade,
        { provide: SessionFacade, useValue: session },
        { provide: ToastService, useValue: { show: () => undefined } },
        { provide: GET_PROFILE, useValue: { execute: () => of(profile) } },
        { provide: UPDATE_PROFILE, useValue: { execute: update } },
        { provide: ADD_PROFILE_EMAIL, useValue: { execute: addEmail } },
        { provide: RESEND_EMAIL_VERIFICATION, useValue: { execute: () => of(profile) } },
        { provide: MAKE_PRIMARY_EMAIL, useValue: { execute: () => of(profile) } },
        { provide: REMOVE_PROFILE_EMAIL, useValue: { execute: () => of(profile) } },
      ],
    });
    const facade = TestBed.inject(ProfileFacade);
    facade.load();
    return facade;
  }

  it('carga el perfil, llena el formulario y actualiza el encabezado', () => {
    const facade = setup();
    expect(facade.loading()).toBeFalse();
    expect(facade.form()).toEqual({ businessName: '', firstName: 'Ana', lastName: 'Pérez' });
    expect(facade.role().label).toBe('Administrador del portal');
    expect(session.updateIdentity).toHaveBeenCalledWith('Ana Pérez', 'ana@b.pe');
  });

  it('abre la pestaña Contraseña si la contraseña es temporal', () => {
    expect(setup(true).tab()).toBe('password');
  });

  it('guarda solo nombres y apellidos del personal interno', () => {
    const facade = setup();
    facade.setField('lastName', ' Ruiz ');
    facade.save();
    expect(update).toHaveBeenCalledWith({ firstName: 'Ana', lastName: 'Ruiz' });
    expect(session.updateIdentity).toHaveBeenCalledWith('Ana Ruiz', 'ana@b.pe');
    expect(facade.dirty()).toBeFalse();
  });

  it('no envía un correo repetido', () => {
    const facade = setup();
    facade.setNewEmail(' ANA@b.pe ');
    facade.addEmail();
    expect(addEmail).not.toHaveBeenCalled();
    expect(facade.emailError()).toContain('ya está registrado');
  });

  it('pide la contraseña actual y muestra el error del servidor', () => {
    const facade = setup();
    facade.password.set('Clave2026');
    facade.confirmation.set('Clave2026');
    facade.changePassword();
    expect(facade.passwordErrors().current).toBe('Ingresa tu contraseña actual.');
    expect(session.changePassword).not.toHaveBeenCalled();

    session.changePassword.and.returnValue(
      throwError(() => new UserFacingError('La contraseña actual no es correcta.')),
    );
    facade.current.set('Anterior1');
    facade.changePassword();
    expect(session.changePassword).toHaveBeenCalledWith('Clave2026', 'Anterior1');
    expect(facade.passwordErrors().current).toBe('La contraseña actual no es correcta.');
  });
});
