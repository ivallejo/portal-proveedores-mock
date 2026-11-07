import { TestBed } from '@angular/core/testing';
import { PaidDocument } from '../../../domain/models/paid-document';
import { PaymentOrder } from '../../../domain/models/payment-order';
import { PaymentOrderListFacade } from '../../facades/payment-order-list.facade';
import { PaymentOrderDetailDialogComponent } from './payment-order-detail-dialog.component';

const doc = (number: string, values: Partial<PaidDocument>): PaidDocument =>
  ({
    number,
    retentionDocument: null,
    detractionCertificate: null,
    detractionRate: null,
    ...values,
  }) as PaidDocument;

const order = {
  number: '2000000123',
  companyName: 'Sociedad',
  documents: [
    doc('F001-1', { retentionDocument: 'R001-0001' }),
    doc('F001-2', { detractionCertificate: '316991800', detractionRate: '12.0 %' }),
    doc('F001-3', {}),
  ],
} as PaymentOrder;

describe('PaymentOrderDetailDialogComponent', () => {
  const openReport = jasmine.createSpy('openReport');

  function render(): HTMLElement {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PaymentOrderListFacade,
          useValue: {
            detailTotals: () => ({ documents: '3', retention: '', detraction: '' }),
            openReport,
            close: () => {},
            openPdf: () => {},
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(PaymentOrderDetailDialogComponent);
    fixture.componentRef.setInput('order', order);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  beforeEach(() => openReport.calls.reset());

  it('abre el informe de retenciones desde el comprobante retenido', () => {
    const button = render().querySelector<HTMLButtonElement>(
      'button[aria-label="Descargar comprobante de retención R001-0001"]',
    );
    expect(button?.textContent).toContain('R001-0001');
    button?.click();
    expect(openReport).toHaveBeenCalledOnceWith(order, 'retention', 'R001-0001');
  });

  it('abre el informe de detracciones desde la constancia', () => {
    const button = render().querySelector<HTMLButtonElement>(
      'button[aria-label="Ver constancia de detracción 316991800"]',
    );
    expect(button?.textContent).toContain('Constancia');
    button?.click();
    expect(openReport).toHaveBeenCalledOnceWith(order, 'detraction', '316991800');
  });

  it('muestra «No aplica» sin botón cuando el comprobante no tiene el dato', () => {
    const page = render();
    expect(page.querySelectorAll('button[aria-label^="Descargar comprobante"]').length).toBe(1);
    expect(page.querySelectorAll('button[aria-label^="Ver constancia"]').length).toBe(1);
    expect(page.textContent?.match(/No aplica/g)?.length).toBe(4);
  });
});
