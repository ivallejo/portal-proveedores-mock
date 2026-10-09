import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Tone } from '../../shared/ui/tone/tone';
import { Currency } from '../../shared/utils/currency';
import { API_BASE_URL } from '../../core/config/api-base-url.token';

export interface Invoice {
  number: string;
  type: string;
  providerRuc: string;
  companyCode: string | null;
  companyName: string | null;
  companyRuc: string | null;
  amount: number;
  currency: Currency;
  issuedAt: string | null;
  hasDetraction: boolean;
  hasRetention: boolean;
  /** Estado tal como lo informa SAP (Recepcionado, Pagado, Documento Anulado…). */
  status: string;
}

export interface InvoiceFilters {
  /** Solo para Cuentas por pagar y el administrador; el proveedor consulta siempre su RUC. */
  ruc: string;
  number: string;
  company: string;
  from: string;
  to: string;
}

/** Agrupa los estados de SAP para los indicadores y el color de la etiqueta. */
export type InvoiceStage = 'paid' | 'issue' | 'progress';

export function invoiceStage(status: string): InvoiceStage {
  const text = status.toLowerCase();
  if (text.includes('pagad')) return 'paid';
  if (text.includes('anulad') || text.includes('rechaz') || text.includes('observ')) return 'issue';
  return 'progress';
}

export function invoiceTone(status: string): Tone {
  const text = status.toLowerCase();
  if (text.includes('pagad')) return 'success';
  if (text.includes('anulad') || text.includes('rechaz')) return 'danger';
  if (text.includes('observ')) return 'warn';
  if (text.includes('recepcion')) return 'info';
  return 'neutral';
}

/** Estado de las facturas del proveedor en SAP, a través de `api/invoices`. */
@Injectable({ providedIn: 'root' })
export class InvoiceStatusService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  search(filters: InvoiceFilters): Observable<Invoice[]> {
    let params = new HttpParams().set('from', filters.from).set('to', filters.to);
    if (filters.ruc) params = params.set('ruc', filters.ruc);
    if (filters.company) params = params.set('company', filters.company);
    if (filters.number.trim()) params = params.set('number', filters.number.trim());
    return this.http.get<Invoice[]>(`${this.apiBaseUrl}/invoices`, { params });
  }
}
