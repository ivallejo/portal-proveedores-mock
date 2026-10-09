import { DocumentSummaryResponseDto } from './document-summary-response.dto';

export interface DocumentPageResponseDto {
  items: DocumentSummaryResponseDto[];
  total: number;
}
