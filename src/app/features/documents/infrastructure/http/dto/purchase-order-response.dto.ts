export interface PurchaseOrderResponseDto {
  number: string;
  orderType: 'Goods' | 'Service';
  deliveryType: 'OnBoard' | 'Warehouse' | null;
  description: string;
  balance: number;
}
