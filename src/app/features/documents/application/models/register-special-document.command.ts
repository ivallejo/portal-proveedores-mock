import { Currency } from '../../domain/models/currency';
import { SpecialDocumentType } from '../../domain/models/special-document-type';

/** Registro de un documento especial con su PDF. */
export interface RegisterSpecialDocumentCommand {
  companyCode: string;
  type: SpecialDocumentType;
  providerRuc: string;
  issuedAt: string;
  number: string;
  amount: number;
  currency: Currency;
  pdf: File;
}
