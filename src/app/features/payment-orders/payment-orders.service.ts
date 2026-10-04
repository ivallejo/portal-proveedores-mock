import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { companyByCode } from '../../shared/data/catalog';
import { Currency } from '../../shared/utils/format';

export interface PaidDocument {
  number: string;
  type: string;
  issuedAt: string;
  amount: number;
  retention: number;
  detraction: number;
  paid: number;
  method: string;
  bank: string;
  account: string;
  cci: string;
  retentionDocument?: string;
  detractionCertificate?: string;
}

export interface PaymentOrder {
  number: string;
  companyCode: string;
  companyName: string;
  companyRuc: string;
  paidAt: string;
  currency: Currency;
  total: number;
  documents: PaidDocument[];
}

export interface PaymentOrderFilters {
  ruc: string;
  company: string;
  from: string;
  to: string;
}

type Row = [string, string, string, Currency, [string, string, string, number, number, number][]];

const ROWS: Row[] = [
  [
    'OP-2026-004812',
    'CAN',
    '2026-09-26',
    'PEN',
    [
      ['F001-00004498', 'Factura', '2026-08-27', 12960.0, 388.8, 0],
      ['F001-00004507', 'Factura', '2026-09-02', 7230.5, 216.92, 0],
    ],
  ],
  [
    'OP-2026-004790',
    'MSU',
    '2026-09-19',
    'PEN',
    [['F001-00004489', 'Factura', '2026-08-20', 5410.0, 0, 649.0]],
  ],
  [
    'OP-2026-004755',
    'SIP',
    '2026-09-12',
    'USD',
    [
      ['F002-00000861', 'Factura', '2026-08-14', 4125.0, 0, 0],
      ['F002-00000869', 'Factura', '2026-08-25', 2300.0, 0, 0],
    ],
  ],
  [
    'OP-2026-004731',
    'CAN',
    '2026-09-05',
    'PEN',
    [['F001-00004475', 'Factura', '2026-08-06', 31200.0, 936.0, 0]],
  ],
  [
    'OP-2026-004702',
    'MSU',
    '2026-08-29',
    'PEN',
    [
      ['F001-00004452', 'Factura', '2026-07-30', 18450.0, 0, 2214.0],
      ['FD01-00000088', 'Nota de débito', '2026-08-03', 860.0, 25.8, 0],
    ],
  ],
  [
    'OP-2026-004688',
    'CAN',
    '2026-08-22',
    'USD',
    [['F002-00000850', 'Factura', '2026-07-23', 9800.0, 0, 0]],
  ],
  [
    'OP-2026-004650',
    'SIP',
    '2026-08-14',
    'PEN',
    [
      ['F001-00004431', 'Factura', '2026-07-15', 3500.0, 105.0, 0],
      ['F001-00004433', 'Factura', '2026-07-16', 1880.0, 56.4, 0],
    ],
  ],
  [
    'OP-2026-004611',
    'CAN',
    '2026-08-07',
    'PEN',
    [['F001-00004410', 'Factura', '2026-07-08', 26780.9, 803.43, 0]],
  ],
];

const BANKS = {
  BCP: {
    bank: 'Banco de Crédito del Perú',
    account: 'Cta. Cte. 191-2345678-0-12',
    cci: '002-191-002345678012-54',
  },
  IBK: { bank: 'Interbank', account: 'Cta. Cte. 200-3001234567', cci: '003-200-003001234567-38' },
  BBVA: {
    bank: 'BBVA Perú',
    account: 'Cta. Cte. US$ 0011-0172-0200345678',
    cci: '011-172-000200345678-19',
  },
};

/** Órdenes de pago emitidas al proveedor (datos de prueba). */
@Injectable({ providedIn: 'root' })
export class PaymentOrdersService {
  private readonly orders: PaymentOrder[] = this.build();

  search(filters: PaymentOrderFilters): Observable<PaymentOrder[]> {
    const result = this.orders.filter(
      (order) =>
        (!filters.ruc ||
          order.companyRuc.includes(filters.ruc) ||
          '20512345678'.includes(filters.ruc)) &&
        (!filters.company || order.companyCode === filters.company) &&
        (!filters.from || order.paidAt >= filters.from) &&
        (!filters.to || order.paidAt <= filters.to),
    );
    return of(result).pipe(delay(1100));
  }

  /** Detalle de una orden (simula la consulta al servicio). */
  detail(number: string): Observable<PaymentOrder | undefined> {
    return of(this.orders.find((order) => order.number === number)).pipe(delay(750));
  }

  private build(): PaymentOrder[] {
    let retentionNumber = 2190;
    return ROWS.map(([number, companyCode, paidAt, currency, docs]) => {
      const company = companyByCode(companyCode)!;
      const documents = docs.map(([doc, type, issuedAt, amount, retention, detraction], index) => {
        const bank = currency === 'USD' ? BANKS.BBVA : index % 2 ? BANKS.IBK : BANKS.BCP;
        const paidDoc: PaidDocument = {
          number: doc,
          type,
          issuedAt,
          amount,
          retention,
          detraction,
          paid: +(amount - retention - detraction).toFixed(2),
          method: 'Transferencia bancaria',
          ...bank,
        };
        if (retention) paidDoc.retentionDocument = `R001-0000${retentionNumber++}`;
        if (detraction)
          paidDoc.detractionCertificate = `0045-${8812300 + index * 17 + Number(number.slice(-3))}`;
        return paidDoc;
      });
      return {
        number,
        companyCode,
        companyName: company.name,
        companyRuc: company.ruc,
        paidAt,
        currency,
        total: documents.reduce((sum, doc) => sum + doc.paid, 0),
        documents,
      };
    });
  }
}
