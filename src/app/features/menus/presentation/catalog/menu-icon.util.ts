import { IconName } from '../../../../shared/ui/icon/icon-name';
import { ICONS } from '../../../../shared/ui/icon/icons';

/** Ícono de una opción; si el nombre guardado no existe, un círculo. */
export function menuIcon(name: string): IconName {
  return name in ICONS ? (name as IconName) : 'circle';
}
