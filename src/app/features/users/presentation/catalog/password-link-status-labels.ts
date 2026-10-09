import { Tone } from '../../../../shared/ui/tone/tone';
import { PasswordLinkStatus } from '../../domain/models/password-link-status';

export const PASSWORD_LINK_STATUS_LABELS: Record<
  PasswordLinkStatus,
  { label: string; tone: Tone }
> = {
  valid: { label: 'Vigente', tone: 'info' },
  used: { label: 'Usado', tone: 'success' },
  replaced: { label: 'Reemplazado', tone: 'gray' },
  expired: { label: 'Expirado', tone: 'gray' },
};
