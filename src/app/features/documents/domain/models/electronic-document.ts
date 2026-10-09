import { Currency } from './currency';
import { DocumentItem } from './document-item';

/** Datos que se muestran en la revisión, leídos del XML del comprobante (UBL 2.1). */
export interface ElectronicDocument {
  number: string;
  series: string;
  documentType: string;
  issuerName: string;
  issuerRuc: string;
  receiverName: string;
  receiverRuc: string;
  issuedAt: string;
  currency: Currency;
  paymentTerms: string;
  items: DocumentItem[];
  subtotal: number;
  igv: number | null;
  total: number;
  /** false cuando los datos se completaron con valores de ejemplo. */
  fromXml: boolean;
}
