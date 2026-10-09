import { Observable } from 'rxjs';
import { CatalogArea } from '../../../domain/models/catalog-area';
import { CatalogCompany } from '../../../domain/models/catalog-company';

/** Sociedades del usuario y áreas con aprobadores (hoy, `api/catalog`). */
export interface CatalogQueryPort {
  companies(): Observable<CatalogCompany[]>;
  areas(): Observable<CatalogArea[]>;
}
