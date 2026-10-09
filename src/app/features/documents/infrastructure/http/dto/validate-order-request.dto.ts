export interface ValidateOrderRequestDto {
  companyCode: string;
  orderType: 'Goods' | 'Service';
  number: string;
}
