import { Observable } from 'rxjs';
import { CatalogCompany } from '../../domain/models/catalog-company';
import { GetCatalogCompaniesPort } from '../ports/in/get-catalog-companies.port';
import { CatalogQueryPort } from '../ports/out/catalog-query.port';

export class GetCatalogCompaniesUseCase implements GetCatalogCompaniesPort {
  constructor(private readonly query: CatalogQueryPort) {}

  execute(): Observable<CatalogCompany[]> {
    return this.query.companies();
  }
}
