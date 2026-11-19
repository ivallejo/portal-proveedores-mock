export interface ValidateOrderRequestDto {
  companyCode: string;
  orderType: 'Goods' | 'Service';
  deliveryType?: 'OnBoard' | 'Warehouse';
  number: string;
}
