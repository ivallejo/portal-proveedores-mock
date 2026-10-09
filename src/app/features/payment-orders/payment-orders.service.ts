import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Currency } from '../../shared/utils/format';
import { API_BASE_URL } from '../../core/config/api-base-url.token';

export interface PaidDocument {
  number: string;
  type: string;
  issuedAt: string | null;
  amount: number;
  retention: number;
  detraction: number;
  paid: number;
  retentionDocument: string | null;
  detractionCertificate: string | null;
  /** Tasa informada por SAP, p. ej. «12.0 %». */
  detractionRate: string | null;
}

export interface PaymentOrder {
  number: string;
  paidAt: string | null;
  companyCode: string;
  companyName: string;
  companyRuc: string | null;
  providerRuc: string;
  providerName: string;
  currency: Currency;
  total: number;
  paymentMethod: string;
  bank: string | null;
  account: string | null;
  paymentDocument: string;
  documents: PaidDocument[];
}

export interface PaymentOrderFilters {
  /** Solo para Cuentas por pagar y el administrador; el proveedor consulta siempre su RUC. */
  ruc: string;
  company: string;
  from: string;
  to: string;
}

/** Órdenes de pago del proveedor, consultadas en SAP a través de `api/payment-orders`. */
@Injectable({ providedIn: 'root' })
export class PaymentOrdersService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  search(filters: PaymentOrderFilters): Observable<PaymentOrder[]> {
    let params = new HttpParams().set('from', filters.from).set('to', filters.to);
    if (filters.ruc) params = params.set('ruc', filters.ruc);
    if (filters.company) params = params.set('company', filters.company);
    return this.http.get<PaymentOrder[]>(`${this.apiBaseUrl}/payment-orders`, { params });
  }
}
