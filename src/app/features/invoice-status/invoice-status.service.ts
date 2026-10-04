import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { companyByCode } from '../../shared/data/catalog';
import { Tone } from '../../shared/ui/tone';
import { Currency } from '../../shared/utils/format';

export type InvoiceStatus =
  'Registrada' | 'En revisión' | 'Observada' | 'Aprobada' | 'Pagada' | 'Rechazada';

export interface Invoice {
  ruc: string;
  number: string;
  companyCode: string;
  companyName: string;
  amount: number;
  currency: Currency;
  registeredAt: string;
  detraction: boolean;
  retention: boolean;
  status: InvoiceStatus;
}

export interface InvoiceFilters {
  ruc: string;
  number: string;
  company: string;
  from: string;
  to: string;
}

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, Tone> = {
  Registrada: 'neutral',
  'En revisión': 'info',
  Observada: 'warn',
  Aprobada: 'teal',
  Pagada: 'success',
  Rechazada: 'danger',
};

const ROWS: [string, string, string, number, Currency, string, boolean, boolean, InvoiceStatus][] =
  [
    [
      '20512345678',
      'F001-00004521',
      'CAN',
      18450.0,
      'PEN',
      '2026-09-24',
      false,
      true,
      'En revisión',
    ],
    ['20512345678', 'F001-00004507', 'CAN', 7230.5, 'PEN', '2026-09-18', false, true, 'Aprobada'],
    ['20512345678', 'F001-00004502', 'MSU', 5410.0, 'PEN', '2026-09-15', true, false, 'Observada'],
    [
      '20601122334',
      'F002-00000877',
      'SIP',
      9800.0,
      'USD',
      '2026-09-10',
      false,
      false,
      'Registrada',
    ],
    ['20512345678', 'F001-00004498', 'CAN', 12960.0, 'PEN', '2026-09-03', false, true, 'Pagada'],
    ['20512345678', 'F001-00004489', 'MSU', 22300.0, 'PEN', '2026-08-28', true, false, 'Pagada'],
    ['20601122334', 'F002-00000869', 'SIP', 2300.0, 'USD', '2026-08-25', false, false, 'Aprobada'],
    ['20512345678', 'F001-00004466', 'CAN', 26780.9, 'PEN', '2026-08-22', false, true, 'Rechazada'],
    ['20512345678', 'F001-00004452', 'MSU', 18450.0, 'PEN', '2026-08-14', true, false, 'Pagada'],
    ['20512345678', 'F001-00004431', 'SIP', 3500.0, 'PEN', '2026-08-06', false, true, 'Pagada'],
  ];

/** Seguimiento de facturas registradas (datos de prueba). */
@Injectable({ providedIn: 'root' })
export class InvoiceStatusService {
  private readonly invoices: Invoice[] = ROWS.map(
    ([
      ruc,
      number,
      companyCode,
      amount,
      currency,
      registeredAt,
      detraction,
      retention,
      status,
    ]) => ({
      ruc,
      number,
      companyCode,
      companyName: companyByCode(companyCode)?.name ?? companyCode,
      amount,
      currency,
      registeredAt,
      detraction,
      retention,
      status,
    }),
  );

  search(filters: InvoiceFilters): Observable<Invoice[]> {
    const number = filters.number.trim().toUpperCase();
    const result = this.invoices.filter(
      (invoice) =>
        (!filters.ruc || invoice.ruc.includes(filters.ruc)) &&
        (!number || invoice.number.includes(number)) &&
        (!filters.company || invoice.companyCode === filters.company) &&
        (!filters.from || invoice.registeredAt >= filters.from) &&
        (!filters.to || invoice.registeredAt <= filters.to),
    );
    return of(result).pipe(delay(1100));
  }
}
