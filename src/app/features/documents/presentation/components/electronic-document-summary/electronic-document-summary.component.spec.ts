import { TestBed } from '@angular/core/testing';
import { ElectronicDocument } from '../../../domain/models/electronic-document';
import { ElectronicDocumentSummaryComponent } from './electronic-document-summary.component';

describe('ElectronicDocumentSummaryComponent', () => {
  it('muestra los datos leídos del XML', () => {
    const fixture = TestBed.createComponent(ElectronicDocumentSummaryComponent);
    fixture.componentRef.setInput('document', {
      number: 'F001-00004521',
      series: 'F001',
      documentType: 'Factura',
      issuerName: 'Andes Suministros S.A.C.',
      issuerRuc: '20512345678',
      receiverName: 'Naviera',
      receiverRuc: '20522163890',
      issuedAt: '2026-10-01',
      currency: 'PEN',
      paymentTerms: '',
      items: [],
      subtotal: 100,
      igv: 18,
      total: 118,
      fromXml: true,
    } satisfies ElectronicDocument);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('F001-00004521');
    expect(text).toContain('01/10/2026');
    expect(text).toContain('Andes Suministros S.A.C.');
    expect(text).toContain('RUC 20512345678');
    expect(text).toContain('S/ 118.00');
  });
});
