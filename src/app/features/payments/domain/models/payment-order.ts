import { Currency } from './currency';
import { PaidDocument } from './paid-document';

/** Pago al proveedor registrado en SAP, con los comprobantes que cancela. */
export interface PaymentOrder {
  number: string;
  paidAt: string | null;
  companyCode: string;
  companyName: string;
  companyRuc: string | null;
  providerRuc: string;
  providerName: string;
  currency: Currency;
  total: number;
  paymentMethod: string;
  bank: string | null;
  account: string | null;
  paymentDocument: string;
  documents: PaidDocument[];
}
