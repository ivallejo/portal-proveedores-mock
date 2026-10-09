import { PaidDocumentResponseDto } from './paid-document-response.dto';

/** Respuesta de `api/payment-orders`. */
export interface PaymentOrderResponseDto {
  number: string;
  paidAt: string | null;
  companyCode: string;
  companyName: string;
  companyRuc: string | null;
  providerRuc: string;
  providerName: string;
  currency: 'PEN' | 'USD';
  total: number;
  paymentMethod: string;
  bank: string | null;
  account: string | null;
  paymentDocument: string;
  documents: PaidDocumentResponseDto[];
}
