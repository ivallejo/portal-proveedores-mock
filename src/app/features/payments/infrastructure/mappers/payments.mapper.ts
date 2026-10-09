import { Invoice } from '../../domain/models/invoice';
import { PaymentOrder } from '../../domain/models/payment-order';
import { InvoiceResponseDto } from '../http/dto/invoice-response.dto';
import { PaymentOrderResponseDto } from '../http/dto/payment-order-response.dto';

export function toPaymentOrder(dto: PaymentOrderResponseDto): PaymentOrder {
  return { ...dto, documents: dto.documents.map((doc) => ({ ...doc })) };
}

export function toInvoice(dto: InvoiceResponseDto): Invoice {
  return { ...dto };
}
