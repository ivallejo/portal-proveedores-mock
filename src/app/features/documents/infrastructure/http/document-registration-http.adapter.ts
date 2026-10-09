import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { apiErrorMessage } from '../../../../core/http/api-error-message';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { RegisterElectronicDocumentCommand } from '../../application/models/register-electronic-document.command';
import { RegisterSpecialDocumentCommand } from '../../application/models/register-special-document.command';
import { DocumentRegistrationPort } from '../../application/ports/out/document-registration.port';
import { DocumentRejectedError } from '../../domain/errors/document-rejected.error';
import { PortalDocument } from '../../domain/models/portal-document';
import {
  toPortalDocument,
  toRegistrationForm,
  toSpecialRegistrationForm,
} from '../mappers/document.mapper';
import { DocumentDetailResponseDto } from './dto/document-detail-response.dto';

/** Registro de documentos (multipart) contra `api/documents` y `api/documents/special`. */
@Injectable()
export class DocumentRegistrationHttpAdapter implements DocumentRegistrationPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/documents`;

  register(command: RegisterElectronicDocumentCommand): Observable<PortalDocument> {
    return this.send(this.base, toRegistrationForm(command));
  }

  registerSpecial(command: RegisterSpecialDocumentCommand): Observable<PortalDocument> {
    return this.send(`${this.base}/special`, toSpecialRegistrationForm(command));
  }

  private send(url: string, form: FormData): Observable<PortalDocument> {
    return this.http.post<DocumentDetailResponseDto>(url, form).pipe(
      map(toPortalDocument),
      catchError((error: unknown) =>
        // 422: el documento no superó la validación de SAP, SUNAT o duplicidad.
        throwError(() =>
          error instanceof HttpErrorResponse && error.status === 422
            ? new DocumentRejectedError(apiErrorMessage(error, ''))
            : toUserFacingError(error),
        ),
      ),
    );
  }
}
