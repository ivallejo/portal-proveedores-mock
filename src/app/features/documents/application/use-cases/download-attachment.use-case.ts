import { Observable } from 'rxjs';
import { DownloadAttachmentPort } from '../ports/in/download-attachment.port';
import { DocumentQueryPort } from '../ports/out/document-query.port';

export class DownloadAttachmentUseCase implements DownloadAttachmentPort {
  constructor(private readonly query: DocumentQueryPort) {}

  execute(documentId: string, attachmentId: string): Observable<Blob> {
    return this.query.downloadAttachment(documentId, attachmentId);
  }
}
