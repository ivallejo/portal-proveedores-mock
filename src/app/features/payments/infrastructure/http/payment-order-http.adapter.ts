import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { PaymentOrderFilter } from '../../application/models/payment-order-filter';
import { PaymentOrderQueryPort } from '../../application/ports/out/payment-order-query.port';
import { PaymentOrder } from '../../domain/models/payment-order';
import { toPaymentOrder } from '../mappers/payments.mapper';
import { PaymentOrderResponseDto } from './dto/payment-order-response.dto';

/** Órdenes de pago consultadas en SAP a través de `api/payment-orders`. */
@Injectable()
export class PaymentOrderHttpAdapter implements PaymentOrderQueryPort {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/payment-orders`;

  search(filter: PaymentOrderFilter): Observable<PaymentOrder[]> {
    let params = new HttpParams().set('from', filter.from).set('to', filter.to);
    if (filter.ruc) params = params.set('ruc', filter.ruc);
    if (filter.company) params = params.set('company', filter.company);
    return this.http.get<PaymentOrderResponseDto[]>(this.url, { params }).pipe(
      map((orders) => orders.map(toPaymentOrder)),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
