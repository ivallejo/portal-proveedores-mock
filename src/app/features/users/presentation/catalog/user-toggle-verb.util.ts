import { UserSummary } from '../../domain/models/user-summary';

/** Acción del botón de estado: desactivar una cuenta activa, desbloquear una bloqueada o activar una inactiva. */
export function userToggleVerb(row: UserSummary): string {
  return row.status === 'active'
    ? 'Desactivar'
    : row.status === 'locked'
      ? 'Desbloquear'
      : 'Activar';
}
