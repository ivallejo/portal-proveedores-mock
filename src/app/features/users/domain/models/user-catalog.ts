import { CatalogArea } from './catalog-area';
import { CatalogCompany } from './catalog-company';
import { CatalogRole } from './catalog-role';

/** Roles, áreas y sociedades (con su estado, para mostrar deshabilitadas las inactivas). */
export interface UserCatalog {
  roles: CatalogRole[];
  areas: CatalogArea[];
  companies: CatalogCompany[];
}
