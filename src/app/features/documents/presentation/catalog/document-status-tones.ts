import { Tone } from '../../../../shared/ui/tone/tone';
import { DocumentStatus } from '../../domain/models/document-status';

export const STATUS_TONE: Record<DocumentStatus, Tone> = {
  'Pendiente de aprobación': 'warn',
  Aprobado: 'teal',
  'Pendiente de contabilización': 'info',
  Contabilizado: 'success',
  Observado: 'warn',
  Rechazado: 'danger',
};
