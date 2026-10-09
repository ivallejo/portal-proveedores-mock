import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { PurchaseOrderValidatorPort } from '../../application/ports/out/purchase-order-validator.port';
import { OrderType } from '../../domain/models/order-type';
import { PurchaseOrder } from '../../domain/models/purchase-order';
import { toApiOrderType, toPurchaseOrder } from '../mappers/document.mapper';
import { PurchaseOrderResponseDto } from './dto/purchase-order-response.dto';
import { ValidateOrderRequestDto } from './dto/validate-order-request.dto';

/** Servicio 01 de SAP a través de `api/documents/orders/validate`; 422 = SAP no reconoce la orden. */
@Injectable()
export class PurchaseOrderHttpAdapter implements PurchaseOrderValidatorPort {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/documents/orders/validate`;

  validate(companyCode: string, type: OrderType, number: string): Observable<PurchaseOrder | null> {
    const body: ValidateOrderRequestDto = { companyCode, orderType: toApiOrderType(type), number };
    return this.http.post<PurchaseOrderResponseDto>(this.url, body).pipe(
      map(toPurchaseOrder),
      catchError((error: unknown) =>
        error instanceof HttpErrorResponse && error.status === 422
          ? of(null)
          : throwError(() => toUserFacingError(error)),
      ),
    );
  }
}
