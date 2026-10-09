export interface PurchaseOrderResponseDto {
  number: string;
  orderType: 'Goods' | 'Service';
  description: string;
  balance: number;
}
