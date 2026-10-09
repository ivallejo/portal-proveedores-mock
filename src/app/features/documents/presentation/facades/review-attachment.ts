import { AttachmentTag } from '../../domain/models/attachment-tag';

/** Archivo que se muestra en la revisión antes de registrar. */
export interface ReviewAttachment {
  tag: AttachmentTag;
  name: string;
  detail: string;
  status: string;
  na?: boolean;
  extra?: boolean;
}
