import { Tone } from '../../../../shared/ui/tone/tone';
import { AccessRole } from '../../domain/models/access-role';

const ROLE_TONES: Record<string, Tone> = {
  ADMINISTRATOR: 'purple',
  PROVIDER: 'info',
  AREA_APPROVER: 'teal',
  ACCOUNTS_PAYABLE: 'orange',
};

/** Color de la insignia de cada rol base; los roles creados en el portal van en gris. */
export function roleTone(role: AccessRole): Tone {
  return ROLE_TONES[role.code] ?? 'gray';
}
