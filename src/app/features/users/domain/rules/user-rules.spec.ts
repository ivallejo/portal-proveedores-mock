import { CatalogArea } from '../models/catalog-area';
import { UserEmail } from '../models/user-email';
import {
  canBePrimaryEmail,
  internalDniError,
  newUserEmailError,
  normalizeUserDocument,
  personNameError,
  providerRucError,
  userAreaError,
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
  companyCode: '1001',
  companyName: 'Naviera',
  isActive: true,
};

describe('user rules', () => {
  it('validates the provider RUC and the internal DNI', () => {
    expect(normalizeUserDocument('20-1001 26606 99', true)).toBe('20100126606');
    expect(normalizeUserDocument('4000000123', false)).toBe('40000001');
    expect(providerRucError('2010012660')).toBe('El RUC debe tener 11 dígitos.');
    expect(providerRucError('30100126606')).toBe('El RUC debe empezar con 10 o 20.');
    expect(providerRucError('10456789012')).toBeUndefined();
    expect(internalDniError('4000000')).toBe('El DNI debe tener 8 dígitos.');
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
      'El área es de Naviera: asígnale también esa sociedad.',
    );
    expect(userAreaError('a1', 'AREA_APPROVER', compras, ['1001'])).toBeUndefined();
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
