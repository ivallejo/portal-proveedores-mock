import { SelectOption } from '../../../shared/ui/select/select-option';

/** Filtro de estado de Configuración: todas, activas o inactivas. */
export type StatusFilter = '' | 'active' | 'inactive';

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

/** Búsqueda sin distinguir mayúsculas ni tildes. */
export function normalize(value: string | null | undefined): string {
  return (value ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function includesTerm(term: string, ...values: (string | null | undefined)[]): boolean {
  const needle = normalize(term.trim());
  return !needle || values.some((value) => normalize(value).includes(needle));
}
