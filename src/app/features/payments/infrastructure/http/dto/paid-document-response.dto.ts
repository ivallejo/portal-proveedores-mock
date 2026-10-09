export interface PaidDocumentResponseDto {
  number: string;
  type: string;
  issuedAt: string | null;
  amount: number;
  retention: number;
  detraction: number;
  paid: number;
  retentionDocument: string | null;
  detractionCertificate: string | null;
  detractionRate: string | null;
}
