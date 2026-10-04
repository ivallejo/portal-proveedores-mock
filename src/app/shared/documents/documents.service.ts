import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiDocumentDetail,
  ApiPage,
  fromDetail,
  fromSummary,
  toApiStatus,
} from './document.mapper';
import { Attachment, DocumentStatus, PortalDocument } from './document.model';

export interface DocumentFilters {
  ruc: string;
  status: string;
}

export const APPROVAL_STATUSES: DocumentStatus[] = [
  'Pendiente de aprobación',
  'Aprobado',
  'Pendiente de contabilización',
  'Rechazado',
];

export const ACCOUNTING_STATUSES: DocumentStatus[] = [
  'Pendiente de contabilización',
  'Contabilizado',
  'Observado',
  'Rechazado',
];

/** Mensaje legible de un error HTTP del backend (campo `message`). */
export function apiErrorMessage(
  error: unknown,
  fallback = 'Inténtalo nuevamente en unos minutos.',
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'No fue posible conectar con el servidor. Inténtalo en unos minutos.';
    const message = error.error?.message ?? error.error?.detail;
    if (typeof message === 'string' && message) return message;
    const first = error.error?.errors && Object.values<string[]>(error.error.errors)[0]?.[0];
    if (first) return first;
  }
  return fallback;
}

/** Documentos del portal contra `api/documents`. */
@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/documents`;

  /** Bandeja del aprobador (el administrador ve todas). */
  approvals(filters: DocumentFilters): Observable<PortalDocument[]> {
    return this.search('Approvals', filters);
  }

  /** Bandeja de Cuentas por pagar. */
  accounting(filters: DocumentFilters): Observable<PortalDocument[]> {
    return this.search('Accounting', filters);
  }

  get(id: string): Observable<PortalDocument> {
    return this.http.get<ApiDocumentDetail>(`${this.base}/${id}`).pipe(map(fromDetail));
  }

  approve(
    id: string,
    referenceType: 'pedido' | 'viaje',
    reference: string,
  ): Observable<PortalDocument> {
    return this.post(id, 'approve', {
      referenceType: referenceType === 'viaje' ? 'Trip' : 'Order',
      reference,
    });
  }

  reassign(id: string, approverId: string, reason: string): Observable<PortalDocument> {
    return this.post(id, 'reassign', { approverId, reason });
  }

  reject(
    id: string,
    reason: string,
    stage: 'aprobador' | 'contabilidad',
  ): Observable<PortalDocument> {
    return this.post(id, stage === 'contabilidad' ? 'accounting/reject' : 'reject', { reason });
  }

  observe(id: string, reason: string, email: string): Observable<PortalDocument> {
    return this.post(id, 'accounting/observe', { reason, email });
  }

  /** Registro Con OC / Sin OC (multipart con XML, PDF, CDR y extras). */
  register(form: FormData): Observable<PortalDocument> {
    return this.http.post<ApiDocumentDetail>(this.base, form).pipe(map(fromDetail));
  }

  registerSpecial(form: FormData): Observable<PortalDocument> {
    return this.http.post<ApiDocumentDetail>(`${this.base}/special`, form).pipe(map(fromDetail));
  }

  /** Descarga un adjunto con el token de la sesión y lo entrega al navegador. */
  download(document: PortalDocument, attachment: Attachment): Observable<void> {
    return this.http
      .get(`${this.base}/${document.id}/attachments/${attachment.id}`, { responseType: 'blob' })
      .pipe(
        map((blob) => {
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = attachment.name;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
        }),
      );
  }

  private search(
    inbox: 'Approvals' | 'Accounting',
    filters: DocumentFilters,
  ): Observable<PortalDocument[]> {
    let params = new HttpParams().set('inbox', inbox).set('page', 1).set('pageSize', 100);
    if (filters.ruc) params = params.set('ruc', filters.ruc);
    const status = filters.status ? toApiStatus(filters.status) : '';
    if (status) params = params.set('status', status);
    return this.http
      .get<ApiPage>(this.base, { params })
      .pipe(map((page) => page.items.map(fromSummary)));
  }

  private post(id: string, action: string, body: object): Observable<PortalDocument> {
    return this.http
      .post<ApiDocumentDetail>(`${this.base}/${id}/${action}`, body)
      .pipe(map(fromDetail));
  }
}
