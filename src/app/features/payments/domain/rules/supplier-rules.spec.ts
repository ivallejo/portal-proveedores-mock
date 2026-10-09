import {
  defaultQueryPeriod,
  isSupplierUser,
  missingRucError,
  normalizeDocumentNumber,
  normalizeRuc,
} from './supplier-rules';

describe('supplier-rules', () => {
  it('el proveedor consulta su RUC; el administrador con rol de proveedor indica el RUC', () => {
    expect(isSupplierUser(['Proveedor'])).toBeTrue();
    expect(isSupplierUser(['Proveedor', 'Administrador'])).toBeFalse();
    expect(isSupplierUser(['CxP'])).toBeFalse();
  });

  it('pide el RUC de 11 dígitos solo si no es proveedor', () => {
    expect(missingRucError(true, '')).toBe('');
    expect(missingRucError(false, '2012345678')).toContain('11 dígitos');
    expect(missingRucError(false, '20123456789')).toBe('');
  });

  it('normaliza el RUC y el número de comprobante', () => {
    expect(normalizeRuc('20-123 456 789 99')).toBe('20123456789');
    expect(normalizeDocumentNumber('f001-00001234567')).toBe('F001-00001234');
  });

  it('propone los últimos tres meses', () => {
    expect(defaultQueryPeriod(new Date(2026, 9, 9))).toEqual({
      from: '2026-07-09',
      to: '2026-10-09',
    });
  });
});
