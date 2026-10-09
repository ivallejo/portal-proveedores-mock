import {
  billingEmailError,
  normalizeSocietyCode,
  normalizeSocietyRuc,
  societyCodeError,
  societyRucError,
} from './society-rules';

describe('society rules', () => {
  it('normalizes the SAP code and the RUC as the user types', () => {
    expect(normalizeSocietyCode('ab-12x9')).toBe('AB12X');
    expect(normalizeSocietyRuc('20 5221-6389 0 99')).toBe('20522163890');
  });

  it('validates code, RUC and billing email like the backend', () => {
    expect(societyCodeError('')).toBe('Ingresa el código.');
    expect(societyCodeError('A')).toBe('De 2 a 5 letras o números.');
    expect(societyCodeError('1001')).toBeUndefined();
    expect(societyRucError('2052216389')).toBe('El RUC debe tener 11 dígitos.');
    expect(societyRucError('10522163890')).toBe('El RUC de una empresa empieza con 20.');
    expect(societyRucError('20522163890')).toBeUndefined();
    expect(billingEmailError('facturacion@empresa')).toBe('Ingresa un correo válido.');
    expect(billingEmailError(' facturacion@empresa.pe ')).toBeUndefined();
  });
});
