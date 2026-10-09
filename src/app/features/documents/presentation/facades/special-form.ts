import { Currency } from '../../domain/models/currency';
import { SpecialDocumentType } from '../../domain/models/special-document-type';

/** Datos de un documento especial tal como los escribe el usuario. */
export interface SpecialForm {
  type: SpecialDocumentType;
  ruc: string;
  date: string;
  number: string;
  amount: string;
  currency: Currency;
}
