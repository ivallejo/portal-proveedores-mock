import { AttachmentTag } from '../../domain/models/attachment-tag';

/** Etiquetas de colores de los tipos de archivo adjunto. */
export const ATTACHMENT_TONE: Record<AttachmentTag, string> = {
  XML: 'bg-[#E8F0FE] text-[#1E3FA8]',
  PDF: 'bg-[#FDE8E8] text-[#A51E1E]',
  CDR: 'bg-[#DFF4F4] text-[#0B5E61]',
  ZIP: 'bg-[#EDE7FB] text-[#5B3AA8]',
};
