import { SelectOption } from '../../../../shared/ui/select/select-option';
import { DocumentStatus } from '../../domain/models/document-status';
import { STATUS_TONE } from './document-status-tones';

/** Opciones del filtro de estado de una bandeja. */
export function statusOptions(statuses: readonly DocumentStatus[]): SelectOption[] {
  return [
    { value: '', label: 'Todos los estados' },
    ...statuses.map((status) => ({ value: status, label: status, tone: STATUS_TONE[status] })),
  ];
}
