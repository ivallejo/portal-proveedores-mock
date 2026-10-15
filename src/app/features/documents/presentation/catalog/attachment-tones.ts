import { AttachmentTag } from '../../domain/models/attachment-tag';

/** Etiquetas de colores de los tipos de archivo adjunto. */
export const ATTACHMENT_TONE: Record<AttachmentTag, string> = {
  XML: 'bg-primary-soft text-indigo-text',
  PDF: 'bg-danger-soft-alt text-danger-text-alt',
  CDR: 'bg-teal-soft text-teal-text',
  ZIP: 'bg-violet-soft text-violet-text',
};
