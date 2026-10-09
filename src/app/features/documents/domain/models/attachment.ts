import { AttachmentTag } from './attachment-tag';

/** Archivo adjunto del documento. */
export interface Attachment {
  tag: AttachmentTag;
  name: string;
  /** Identificador en el backend, necesario para descargar el archivo. */
  id?: string;
}
