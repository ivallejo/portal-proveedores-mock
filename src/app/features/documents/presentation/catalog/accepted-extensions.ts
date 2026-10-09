import { AttachmentSlot } from '../facades/attachment-slot';

/** Extensiones permitidas por archivo. */
export const ACCEPT: Record<AttachmentSlot | 'extra', string[]> = {
  xml: ['.xml'],
  pdf: ['.pdf'],
  cdr: ['.zip', '.xml'],
  extra: ['.pdf'],
};
