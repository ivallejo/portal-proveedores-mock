import { SelectOption } from '../ui/select/select-option';
import { StatusFilter } from './status-filter';

export function statusOptions(feminine: boolean): SelectOption[] {
  return [
    { value: '', label: 'Todos los estados' },
    { value: 'active', label: feminine ? 'Activas' : 'Activos' },
    { value: 'inactive', label: feminine ? 'Inactivas' : 'Inactivos' },
  ];
}

export function matchesStatus(isActive: boolean, filter: StatusFilter): boolean {
  return !filter || (filter === 'active') === isActive;
}
