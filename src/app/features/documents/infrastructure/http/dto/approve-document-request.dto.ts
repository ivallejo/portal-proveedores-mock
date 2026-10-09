export interface ApproveDocumentRequestDto {
  referenceType: 'Order' | 'Trip';
  reference: string;
}
