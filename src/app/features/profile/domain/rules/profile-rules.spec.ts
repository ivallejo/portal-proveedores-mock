import { Profile } from '../models/profile';
import {
  accessIdOf,
  isPersonalDataDirty,
  newProfileEmailError,
  passwordStrength,
  personalDataChanges,
  personalDataErrors,
  taxpayerTypeOf,
} from './profile-rules';

const base: Profile = {
  username: '45678123',
  isProvider: false,
  ruc: null,
  displayName: 'Ana Pérez',
  businessName: null,
  firstName: 'Ana',
  lastName: 'Pérez',
  roles: ['Área Usuaria'],
  areaName: 'Compras',
  areaCompanyName: 'Naviera',
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

describe('profile-rules', () => {
  it('muestra el usuario de acceso como RUC, DNI o el usuario', () => {
    expect(accessIdOf({ ...base, isProvider: true, ruc: '20123456789' })).toBe('RUC 20123456789');
    expect(accessIdOf(base)).toBe('DNI 45678123');
    expect(accessIdOf({ ...base, username: 'prueba.admin' })).toBe('prueba.admin');
  });

  it('distingue persona natural con negocio de persona jurídica', () => {
    expect(taxpayerTypeOf('10456781231')).toBe('Persona natural con negocio');
    expect(taxpayerTypeOf('20123456789')).toBe('Persona jurídica');
  });

  it('el proveedor solo edita su razón social', () => {
    const provider = { ...base, isProvider: true, businessName: 'Acme' };
    const data = { businessName: 'Acme', firstName: 'Otro', lastName: 'Otro' };
    expect(isPersonalDataDirty(provider, data)).toBeFalse();
    expect(personalDataErrors(true, { ...data, businessName: 'Ac' }).businessName).toContain('3');
    expect(personalDataChanges(true, { ...data, businessName: ' Acme SAC ' })).toEqual({
      businessName: 'Acme SAC',
    });
  });

  it('el personal interno edita nombres y apellidos con solo letras', () => {
    const errors = personalDataErrors(false, { businessName: '', firstName: 'Ana1', lastName: '' });
    expect(errors).toEqual({ firstName: 'Usa solo letras.', lastName: 'Ingresa tus apellidos.' });
    expect(
      isPersonalDataDirty(base, { businessName: '', firstName: 'Ana', lastName: 'Pérez Ruiz' }),
    ).toBeTrue();
  });

  it('valida el correo nuevo y que no se repita', () => {
    expect(newProfileEmailError('ana@', base.emails)).toContain('correo válido');
    expect(newProfileEmailError('ana@b.pe', base.emails)).toContain('ya está registrado');
    expect(newProfileEmailError('otra@b.pe', base.emails)).toBeUndefined();
  });

  it('calcula la fuerza de la contraseña', () => {
    expect(passwordStrength('', 0)).toBe(0);
    expect(passwordStrength('abc', 1)).toBe(1);
    expect(passwordStrength('Clave2026', 4)).toBe(3);
    expect(passwordStrength('ClaveSegura2026', 4)).toBe(4);
  });
});
