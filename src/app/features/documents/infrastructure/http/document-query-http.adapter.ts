import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { DocumentInbox } from '../../application/models/document-inbox';
import { InboxFilter } from '../../application/models/inbox-filter';
import { DocumentQueryPort } from '../../application/ports/out/document-query.port';
import { PortalDocument } from '../../domain/models/portal-document';
import { toApiStatus, toDocumentSummary, toPortalDocument } from '../mappers/document.mapper';
import { DocumentDetailResponseDto } from './dto/document-detail-response.dto';
import { DocumentPageResponseDto } from './dto/document-page-response.dto';

/** Bandejas, detalle y adjuntos contra `api/documents`. */
@Injectable()
export class DocumentQueryHttpAdapter implements DocumentQueryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/documents`;

  search(inbox: DocumentInbox, filter: InboxFilter): Observable<PortalDocument[]> {
    let params = new HttpParams().set('inbox', inbox).set('page', 1).set('pageSize', 100);
    if (filter.ruc) params = params.set('ruc', filter.ruc);
    const status = toApiStatus(filter.status);
    if (status) params = params.set('status', status);
    return this.http.get<DocumentPageResponseDto>(this.base, { params }).pipe(
      map((page) => page.items.map(toDocumentSummary)),
      catchError(this.fail),
    );
  }

  get(id: string): Observable<PortalDocument> {
    return this.http
      .get<DocumentDetailResponseDto>(`${this.base}/${id}`)
      .pipe(map(toPortalDocument), catchError(this.fail));
  }

  downloadAttachment(documentId: string, attachmentId: string): Observable<Blob> {
    return this.http
      .get(`${this.base}/${documentId}/attachments/${attachmentId}`, { responseType: 'blob' })
      .pipe(catchError(this.fail));
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
