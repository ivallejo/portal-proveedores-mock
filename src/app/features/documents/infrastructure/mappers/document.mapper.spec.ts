import { toApiStatus, toRegistrationForm, toSpecialRegistrationForm } from './document.mapper';

const file = (name: string) => new File(['x'], name);

describe('document.mapper', () => {
  it('traduce el estado de la interfaz al del backend', () => {
    expect(toApiStatus('Pendiente de contabilización')).toBe('PendingAccounting');
    expect(toApiStatus('')).toBe('');
  });

  it('arma el multipart del registro Con OC', () => {
    const form = toRegistrationForm({
      entryType: 'Con OC',
      companyCode: '1001',
      isPettyCash: false,
      order: { type: 'Bien', number: 'C-1' },
      xml: file('F001-1.xml'),
      pdf: file('F001-1.pdf'),
      extras: [file('a.pdf'), file('b.pdf')],
    });
    expect(form.get('EntryType')).toBe('WithPurchaseOrder');
    expect(form.get('OrderType')).toBe('Goods');
    expect(form.get('IsPettyCash')).toBeNull();
    expect(form.get('ApproverId')).toBeNull();
    expect(form.get('Cdr')).toBeNull();
    expect(form.getAll('Extras').length).toBe(2);
  });

  it('arma el multipart de un documento especial', () => {
    const form = toSpecialRegistrationForm({
      companyCode: '1001',
      type: 'Liquidación de cobranzas',
      providerRuc: '20512345678',
      issuedAt: '2026-10-01',
      number: 'LC-1',
      amount: 1250.5,
      currency: 'USD',
      pdf: file('lc.pdf'),
    });
    expect(form.get('DocumentType')).toBe('CollectionSettlement');
    expect(form.get('Amount')).toBe('1250.5');
  });
});
