/** Respuesta de `api/invoices`. */
export interface InvoiceResponseDto {
  number: string;
  type: string;
  providerRuc: string;
  companyCode: string | null;
  companyName: string | null;
  companyRuc: string | null;
  amount: number;
  currency: 'PEN' | 'USD';
  issuedAt: string | null;
  hasDetraction: boolean;
  hasRetention: boolean;
  status: string;
}
