import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { PROVIDERS } from '../../shared/data/catalog';
import { Tone } from '../../shared/ui/tone';
import { Currency } from '../../shared/utils/format';

export type PurchaseOrderType = 'Orden de compra' | 'Orden de servicio';
export type PurchaseOrderStatus =
  'Emitida' | 'Aceptada' | 'Atendida parcial' | 'Atendida' | 'Anulada';

export interface PurchaseOrder {
  number: string;
  type: PurchaseOrderType;
  date: string;
  currency: Currency;
  amount: number;
  status: PurchaseOrderStatus;
  providerRuc: string;
  providerName: string;
  area: string;
}

export interface PurchaseOrderFilters {
  ruc: string;
  type: string;
  status: string;
  from: string;
  to: string;
}

export const PURCHASE_ORDER_TYPES: PurchaseOrderType[] = ['Orden de compra', 'Orden de servicio'];

export const PURCHASE_ORDER_STATUS_TONE: Record<PurchaseOrderStatus, Tone> = {
  Emitida: 'info',
  Aceptada: 'teal',
  'Atendida parcial': 'warn',
  Atendida: 'success',
  Anulada: 'danger',
};

/** Recorrido normal de una orden; «Anulada» corta el flujo después de «Emitida». */
export const PURCHASE_ORDER_FLOW: PurchaseOrderStatus[] = [
  'Emitida',
  'Aceptada',
  'Atendida parcial',
  'Atendida',
];

const ROWS: [
  string,
  PurchaseOrderType,
  string,
  Currency,
  number,
  PurchaseOrderStatus,
  string,
  string,
][] = [
  [
    'OC01-00012873',
    'Orden de compra',
    '2026-09-26',
    'PEN',
    48250.0,
    'Emitida',
    '20512345678',
    'Operaciones',
  ],
  [
    'OC01-00012851',
    'Orden de compra',
    '2026-09-19',
    'PEN',
    18450.0,
    'Aceptada',
    '20512345678',
    'Mantenimiento',
  ],
  [
    'OS01-00003340',
    'Orden de servicio',
    '2026-09-16',
    'PEN',
    3500.0,
    'Atendida',
    '10456789012',
    'Finanzas',
  ],
  [
    'OC01-00012830',
    'Orden de compra',
    '2026-09-11',
    'USD',
    9800.0,
    'Atendida parcial',
    '20601122334',
    'Logística',
  ],
  [
    'OC01-00012812',
    'Orden de compra',
    '2026-09-02',
    'PEN',
    7230.5,
    'Atendida',
    '20512345678',
    'Operaciones',
  ],
  [
    'OS01-00003318',
    'Orden de servicio',
    '2026-08-27',
    'PEN',
    12000.0,
    'Aceptada',
    '20601122334',
    'Logística',
  ],
  [
    'OC01-00012795',
    'Orden de compra',
    '2026-08-21',
    'PEN',
    26780.9,
    'Anulada',
    '20512345678',
    'Operaciones',
  ],
  [
    'OC01-00012788',
    'Orden de compra',
    '2026-08-18',
    'USD',
    4125.0,
    'Atendida',
    '20601122334',
    'Logística',
  ],
  [
    'OC01-00012760',
    'Orden de compra',
    '2026-08-08',
    'PEN',
    15600.0,
    'Atendida',
    '20512345678',
    'Mantenimiento',
  ],
];

/** Consulta de órdenes de compra y servicio (datos de prueba). */
@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private readonly orders: PurchaseOrder[] = ROWS.map(
    ([number, type, date, currency, amount, status, providerRuc, area]) => ({
      number,
      type,
      date,
      currency,
      amount,
      status,
      providerRuc,
      providerName: PROVIDERS[providerRuc] ?? '',
      area,
    }),
  );

  search(filters: PurchaseOrderFilters): Observable<PurchaseOrder[]> {
    const result = this.orders
      .filter(
        (order) =>
          (!filters.ruc || order.providerRuc.includes(filters.ruc)) &&
          (!filters.type || order.type === filters.type) &&
          (!filters.status || order.status === filters.status) &&
          (!filters.from || order.date >= filters.from) &&
          (!filters.to || order.date <= filters.to),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
    return of(result).pipe(delay(700));
  }
}
