import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { DocumentAccountingPort } from '../../application/ports/out/document-accounting.port';
import { PortalDocument } from '../../domain/models/portal-document';
import { toPortalDocument } from '../mappers/document.mapper';
import { DocumentDetailResponseDto } from './dto/document-detail-response.dto';
import { ObserveDocumentRequestDto } from './dto/observe-document-request.dto';
import { RejectDocumentRequestDto } from './dto/reject-document-request.dto';

/** Acciones de Cuentas por pagar contra `api/documents/{id}/accounting/…`. */
@Injectable()
export class DocumentAccountingHttpAdapter implements DocumentAccountingPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/documents`;

  reject(id: string, reason: string): Observable<PortalDocument> {
    const body: RejectDocumentRequestDto = { reason };
    return this.post(id, 'accounting/reject', body);
  }

  observe(id: string, reason: string, email: string): Observable<PortalDocument> {
    const body: ObserveDocumentRequestDto = { reason, email };
    return this.post(id, 'accounting/observe', body);
  }

  private post(id: string, action: string, body: object): Observable<PortalDocument> {
    return this.http.post<DocumentDetailResponseDto>(`${this.base}/${id}/${action}`, body).pipe(
      map(toPortalDocument),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
