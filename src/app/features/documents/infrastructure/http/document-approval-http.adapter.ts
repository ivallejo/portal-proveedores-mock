import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { DocumentApprovalPort } from '../../application/ports/out/document-approval.port';
import { ApprovalReferenceType } from '../../domain/models/approval-reference-type';
import { PortalDocument } from '../../domain/models/portal-document';
import { toPortalDocument } from '../mappers/document.mapper';
import { ApproveDocumentRequestDto } from './dto/approve-document-request.dto';
import { DocumentDetailResponseDto } from './dto/document-detail-response.dto';
import { ReassignDocumentRequestDto } from './dto/reassign-document-request.dto';
import { RejectDocumentRequestDto } from './dto/reject-document-request.dto';

/** Acciones del aprobador contra `api/documents/{id}/…`. */
@Injectable()
export class DocumentApprovalHttpAdapter implements DocumentApprovalPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/documents`;

  approve(
    id: string,
    referenceType: ApprovalReferenceType,
    reference: string,
  ): Observable<PortalDocument> {
    const body: ApproveDocumentRequestDto = {
      referenceType: referenceType === 'viaje' ? 'Trip' : 'Order',
      reference,
    };
    return this.post(id, 'approve', body);
  }

  reassign(id: string, approverId: string, reason: string): Observable<PortalDocument> {
    const body: ReassignDocumentRequestDto = { approverId, reason };
    return this.post(id, 'reassign', body);
  }

  reject(id: string, reason: string): Observable<PortalDocument> {
    const body: RejectDocumentRequestDto = { reason };
    return this.post(id, 'reject', body);
  }

  private post(id: string, action: string, body: object): Observable<PortalDocument> {
    return this.http.post<DocumentDetailResponseDto>(`${this.base}/${id}/${action}`, body).pipe(
      map(toPortalDocument),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
