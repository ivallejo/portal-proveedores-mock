/** Comprobante cancelado en una orden de pago. */
export interface PaidDocument {
  number: string;
  type: string;
  issuedAt: string | null;
  amount: number;
  retention: number;
  detraction: number;
  paid: number;
  retentionDocument: string | null;
  detractionCertificate: string | null;
  /** Tasa informada por SAP, p. ej. «12.0 %». */
  detractionRate: string | null;
}
