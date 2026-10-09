import { Observable } from 'rxjs';

export interface DownloadAttachmentPort {
  execute(documentId: string, attachmentId: string): Observable<Blob>;
}
