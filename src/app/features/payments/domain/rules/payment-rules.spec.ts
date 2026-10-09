import { PaymentOrder } from '../models/payment-order';
import { countInStage, invoiceStage } from './invoice-rules';
import { totalPaidIn, withheldTotal } from './payment-order-rules';

const order = (currency: 'PEN' | 'USD', total: number): PaymentOrder =>
  ({
    currency,
    total,
    documents: [
      { retention: 3, detraction: 10 },
      { retention: 2, detraction: 0 },
    ],
  }) as PaymentOrder;

describe('payment and invoice rules', () => {
  it('suma lo pagado por moneda y lo retenido por orden', () => {
    const orders = [order('PEN', 100), order('USD', 50), order('PEN', 20)];
    expect(totalPaidIn(orders, 'PEN')).toBe(120);
    expect(totalPaidIn(orders, 'USD')).toBe(50);
    expect(withheldTotal(orders[0], 'retention')).toBe(5);
    expect(withheldTotal(orders[0], 'detraction')).toBe(10);
  });

  it('agrupa los estados de SAP en etapas', () => {
    expect(invoiceStage('Pagado')).toBe('paid');
    expect(invoiceStage('Documento Anulado')).toBe('issue');
    expect(invoiceStage('Observado')).toBe('issue');
    expect(invoiceStage('Recepcionado')).toBe('progress');
    const invoices = ['Pagado', 'Recepcionado', 'Pagado'].map((status) => ({ status }));
    expect(countInStage(invoices as never, 'paid')).toBe(2);
  });
});
