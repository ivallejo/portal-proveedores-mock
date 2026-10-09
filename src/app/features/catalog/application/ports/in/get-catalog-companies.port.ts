import { Observable } from 'rxjs';
import { CatalogCompany } from '../../../domain/models/catalog-company';

export interface GetCatalogCompaniesPort {
  execute(): Observable<CatalogCompany[]>;
}
