import { ElectronicDocument } from '../models/electronic-document';
import {
  canRegisterSpecialDocuments,
  canRegisterWithPurchaseOrder,
  needsApprover,
  isValidObservationEmail,
} from './document-rules';
import {
  MAX_ATTACHMENT_SIZE,
  attachmentError,
  documentNoun,
  isCarrierOrder,
  isCdrRequired,
  orderDelivery,
  orderNumberField,
  registeredText,
  rejectedElectronicText,
  issuerMismatchError,
  parseAmount,
  seriesFromFileName,
} from './registration-rules';
import { sampleElectronicDocument } from './sample-document';

const context = {
  entry: 'Sin OC' as const,
  issuerName: 'Andes',
  issuerRuc: '20512345678',
  receiverName: 'Naviera',
  receiverRuc: '20100000001',
};

describe('registration rules', () => {
  it('valida extensión y tamaño de los adjuntos', () => {
    expect(attachmentError(undefined, ['.pdf'])).toBe('No recibimos ningún archivo.');
    expect(attachmentError({ name: 'a.PDF', size: 10 }, ['.pdf'])).toBe('');
    expect(attachmentError({ name: 'a.doc', size: 10 }, ['.pdf'])).toContain('«a.doc»');
    expect(attachmentError({ name: 'a.pdf', size: MAX_ATTACHMENT_SIZE + 1 }, ['.pdf'])).toContain(
      '5 MB',
    );
  });

  it('obtiene la serie del archivo y sabe cuándo no hay CDR', () => {
    expect(seriesFromFileName('f001-00004530.xml')).toBe('F001');
    expect(seriesFromFileName('comprobante.xml')).toBeNull();
    expect(isCdrRequired('F001')).toBeTrue();
    expect(isCdrRequired('E001')).toBeFalse();
  });

  it('el proveedor solo registra comprobantes de su RUC', () => {
    const doc = { fromXml: true, issuerRuc: '20999999999' } as ElectronicDocument;
    expect(issuerMismatchError(doc, '20512345678')).toContain('20999999999');
    expect(issuerMismatchError(doc, undefined)).toBe('');
    expect(issuerMismatchError({ ...doc, fromXml: false }, '20512345678')).toBe('');
  });

  it('interpreta importes con separador de miles', () => {
    expect(parseAmount('1,250.50')).toBe(1250.5);
  });

  it('arma un comprobante de ejemplo según la serie del archivo', () => {
    const fee = sampleElectronicDocument('E001-00000045.xml', context, '2026-10-09');
    expect(fee.number).toBe('E001-00000045');
    expect(fee.igv).toBeNull();
    expect(fee.fromXml).toBeFalse();
    const invoice = sampleElectronicDocument(null, context, '2026-10-09', 1_700_000_000_000);
    expect(invoice.series).toBe('F001');
    expect(invoice.total).toBe(7080);
  });

  it('decide quién registra cada tipo de ingreso y quién necesita aprobador', () => {
    expect(canRegisterSpecialDocuments(['Colaborador interno'], false)).toBeTrue();
    expect(canRegisterSpecialDocuments(['Proveedor', 'Colaborador interno'], false)).toBeFalse();
    expect(canRegisterSpecialDocuments(['Proveedor'], true)).toBeTrue();
    expect(canRegisterWithPurchaseOrder(['Proveedor'], false)).toBeTrue();
    expect(canRegisterWithPurchaseOrder(['Colaborador interno'], false)).toBeFalse();
    expect(canRegisterWithPurchaseOrder(['Administrador'], true)).toBeTrue();
    expect(needsApprover(['Proveedor'], false)).toBeTrue();
    expect(needsApprover(['Colaborador interno'], false)).toBeFalse();
    expect(needsApprover(['Administrador'], true)).toBeFalse();
    expect(isValidObservationEmail('cxp@empresa.pe')).toBeTrue();
    expect(isValidObservationEmail('cxp@empresa')).toBeFalse();
  });
});

describe('order and result rules (Propuesta 4)', () => {
  it('pide N° de carrier con bien o con servicio entregado en almacén', () => {
    expect(isCarrierOrder('Bien', undefined)).toBeTrue();
    expect(isCarrierOrder('Servicio', 'Entregado en almacén')).toBeTrue();
    expect(isCarrierOrder('Servicio', 'Entregado a bordo')).toBeFalse();
    expect(orderDelivery('Bien', 'Entregado en almacén')).toBeUndefined();
    expect(orderDelivery('Servicio', 'Entregado a bordo')).toBe('Entregado a bordo');
    expect(orderNumberField('Servicio', 'Entregado a bordo').label).toBe('N° de orden de compra');
    expect(orderNumberField('Servicio', 'Entregado en almacén').placeholder).toBe(
      'Ej. CR-2026-00527',
    );
    expect(orderNumberField('Bien', undefined).noun).toBe('el carrier');
  });

  it('arma el texto del resultado según el tipo de ingreso y de comprobante', () => {
    const base = {
      number: 'F001-1',
      documentType: 'Factura electrónica',
      status: 'Pendiente de contabilización',
    };
    expect(
      registeredText({ ...base, entryType: 'Con OC', orderNumber: '4500012873' } as never),
    ).toBe(
      'La factura F001-1 quedó asociada a la orden 4500012873 con estado Pendiente de contabilización.',
    );
    expect(
      registeredText({
        ...base,
        entryType: 'Sin OC',
        status: 'Pendiente de aprobación',
        approver: 'María Torres',
      } as never),
    ).toBe(
      'La factura F001-1 fue enviada a María Torres para su aprobación. Le enviamos un correo con el detalle.',
    );
    expect(registeredText({ ...base, entryType: 'Sin OC' } as never)).toBe(
      'La factura F001-1 se registró directamente como Pendiente de contabilización.',
    );
    expect(documentNoun('Recibo por honorarios electrónico')).toEqual({
      noun: 'El recibo por honorarios',
      feminine: false,
    });
    expect(rejectedElectronicText('F001-1', 'Naviera')).toContain(
      'ya fue registrado anteriormente para Naviera',
    );
  });
});
