import { ElectronicDocument } from '../models/electronic-document';
import {
  canRegisterPettyCash,
  canRegisterSpecialDocuments,
  isValidObservationEmail,
} from './document-rules';
import {
  MAX_ATTACHMENT_SIZE,
  attachmentError,
  isCdrRequired,
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

  it('decide quién registra documentos especiales y Caja Chica', () => {
    expect(canRegisterSpecialDocuments(['Colaborador interno'], false)).toBeTrue();
    expect(canRegisterSpecialDocuments(['Proveedor', 'Colaborador interno'], false)).toBeFalse();
    expect(canRegisterSpecialDocuments(['Proveedor'], true)).toBeTrue();
    expect(canRegisterPettyCash(['Administrador'])).toBeTrue();
    expect(canRegisterPettyCash(['Proveedor'])).toBeFalse();
    expect(isValidObservationEmail('cxp@empresa.pe')).toBeTrue();
    expect(isValidObservationEmail('cxp@empresa')).toBeFalse();
  });
});
