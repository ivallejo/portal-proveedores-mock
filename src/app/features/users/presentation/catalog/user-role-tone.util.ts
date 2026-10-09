import { Tone } from '../../../../shared/ui/tone/tone';

const ROLE_TONES: Record<string, Tone> = {
  ADMINISTRATOR: 'purple',
  PROVIDER: 'info',
  AREA_APPROVER: 'teal',
  ACCOUNTS_PAYABLE: 'orange',
  INTERNAL_USER: 'gray',
};

/** Color de la insignia del rol de un usuario. */
export function userRoleTone(code: string | null): Tone {
  return (code && ROLE_TONES[code]) || 'gray';
}
