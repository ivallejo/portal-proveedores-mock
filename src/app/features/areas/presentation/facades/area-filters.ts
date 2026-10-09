import { StatusFilter } from '../../../../shared/utils/status-filter';

/** Filtros de Configuración › Áreas. */
export interface AreaFilters {
  search: string;
  status: StatusFilter;
  societyId: string;
}
