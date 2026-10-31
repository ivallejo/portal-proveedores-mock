import {
  defaultQueryPeriod,
  exportFileName,
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

  it('propone los últimos 31 días, contando hoy', () => {
    expect(defaultQueryPeriod(new Date(2026, 9, 9))).toEqual({
      from: '2026-09-09',
      to: '2026-10-09',
    });
    expect(defaultQueryPeriod(new Date(2026, 2, 1))).toEqual({
      from: '2026-01-30',
      to: '2026-03-01',
    });
  });

  it('nombra el Excel con el RUC y el periodo', () => {
    expect(
      exportFileName('ordenes-de-pago', '20123456789', { from: '2026-10-01', to: '2026-10-31' }),
    ).toBe('ordenes-de-pago_20123456789_2026-10-01_2026-10-31.xlsx');
  });
});
