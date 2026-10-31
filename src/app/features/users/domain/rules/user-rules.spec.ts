import { CatalogArea } from '../models/catalog-area';
import { UserEmail } from '../models/user-email';
import {
  canBePrimaryEmail,
  identityDocumentError,
  newUserEmailError,
  normalizeUserDocument,
  personNameError,
  providerRucError,
  suggestUsername,
  userAreaError,
  usernameError,
} from './user-rules';

const email = (value: string, isVerified = true): UserEmail => ({
  id: null,
  email: value,
  type: 'work',
  isPrimary: false,
  isVerified,
  createdAtUtc: null,
});
const compras: CatalogArea = {
  id: 'a1',
  name: 'Compras',
  companyCodes: ['1001', '1003'],
  isActive: true,
};

describe('user rules', () => {
  it('validates the provider RUC and the internal document', () => {
    expect(normalizeUserDocument('20-1001 26606 99', 'RUC')).toBe('20100126606');
    expect(normalizeUserDocument('4000000123', 'DNI')).toBe('40000001');
    expect(normalizeUserDocument('x-001 234567890', 'CE')).toBe('X00123456789');
    expect(providerRucError('2010012660')).toBe('El RUC debe tener 11 dígitos.');
    expect(providerRucError('30100126606')).toBe('El RUC debe empezar con 10 o 20.');
    expect(providerRucError('10456789012')).toBeUndefined();
    expect(identityDocumentError('DNI', '4000000')).toBe('El DNI debe tener 8 dígitos.');
    expect(identityDocumentError('CE', 'X0012345')).toBeUndefined();
    expect(identityDocumentError('PASAPORTE', '')).toContain('pasaporte');
  });

  it('validates and suggests the internal username', () => {
    expect(usernameError('mt')).toContain('entre 4 y 50');
    expect(usernameError('maria torres')).toContain('sin espacios');
    expect(usernameError('maría')).toContain('tildes');
    expect(usernameError('20100126606')).toContain('RUC');
    expect(usernameError('m.torres_2')).toBeUndefined();
    expect(suggestUsername('María José', 'Núñez Vega')).toBe('mnunez');
  });

  it('accepts only letters in person names', () => {
    expect(personNameError('  ', 'Ingresa los nombres.')).toBe('Ingresa los nombres.');
    expect(personNameError('Ana 2', 'x')).toBe('Usa solo letras.');
    expect(personNameError("María José O'Brien", 'x')).toBeUndefined();
  });

  it('requires an area of one of the assigned societies (except for the administrator)', () => {
    expect(userAreaError('', 'AREA_APPROVER', undefined, ['1001'])).toBe('Selecciona el área.');
    expect(userAreaError('', 'ADMINISTRATOR', undefined, ['1001'])).toBeUndefined();
    expect(userAreaError('a1', 'AREA_APPROVER', compras, ['1002'])).toBe(
      'El área está en 1001, 1003: asígnale alguna de esas sociedades.',
    );
    expect(userAreaError('a1', 'AREA_APPROVER', compras, ['1002', '1003'])).toBeUndefined();
  });

  it('checks new emails and who can be primary', () => {
    expect(newUserEmailError('sin-arroba', [])).toContain('Ingresa un correo válido');
    expect(newUserEmailError('a@b.pe', [email('a@b.pe')])).toBe(
      'Este correo ya está registrado para el usuario.',
    );
    expect(canBePrimaryEmail(email('a@b.pe', false), true)).toBeFalse();
    expect(canBePrimaryEmail(email('a@b.pe', false), false)).toBeTrue();
  });
});
