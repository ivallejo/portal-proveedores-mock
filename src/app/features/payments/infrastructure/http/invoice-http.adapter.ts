import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { InvoiceFilter } from '../../application/models/invoice-filter';
import { InvoiceQueryPort } from '../../application/ports/out/invoice-query.port';
import { Invoice } from '../../domain/models/invoice';
import { toInvoice } from '../mappers/payments.mapper';
import { InvoiceResponseDto } from './dto/invoice-response.dto';

/** Estado de los comprobantes en SAP a través de `api/invoices`. */
@Injectable()
export class InvoiceHttpAdapter implements InvoiceQueryPort {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/invoices`;

  search(filter: InvoiceFilter): Observable<Invoice[]> {
    let params = new HttpParams().set('from', filter.from).set('to', filter.to);
    if (filter.ruc) params = params.set('ruc', filter.ruc);
    if (filter.company) params = params.set('company', filter.company);
    if (filter.number.trim()) params = params.set('number', filter.number.trim());
    return this.http.get<InvoiceResponseDto[]>(this.url, { params }).pipe(
      map((invoices) => invoices.map(toInvoice)),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
