import { Tone } from '../../../../shared/ui/tone/tone';
import { UserStatus } from '../../domain/models/user-status';

export const USER_STATUS_LABELS: Record<UserStatus, { label: string; tone: Tone }> = {
  active: { label: 'Activo', tone: 'success' },
  inactive: { label: 'Inactivo', tone: 'gray' },
  locked: { label: 'Bloqueado', tone: 'danger' },
};
