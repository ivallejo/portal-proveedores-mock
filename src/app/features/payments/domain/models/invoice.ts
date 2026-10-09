import { Currency } from './currency';

/** Comprobante del proveedor y su estado en SAP. */
export interface Invoice {
  number: string;
  type: string;
  providerRuc: string;
  companyCode: string | null;
  companyName: string | null;
  companyRuc: string | null;
  amount: number;
  currency: Currency;
  issuedAt: string | null;
  hasDetraction: boolean;
  hasRetention: boolean;
  /** Estado tal como lo informa SAP (Recepcionado, Pagado, Documento Anulado…). */
  status: string;
}
