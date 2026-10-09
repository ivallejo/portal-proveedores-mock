import { Observable } from 'rxjs';
import { CatalogArea } from '../../domain/models/catalog-area';
import { GetCatalogAreasPort } from '../ports/in/get-catalog-areas.port';
import { CatalogQueryPort } from '../ports/out/catalog-query.port';

export class GetCatalogAreasUseCase implements GetCatalogAreasPort {
  constructor(private readonly query: CatalogQueryPort) {}

  execute(): Observable<CatalogArea[]> {
    return this.query.areas();
  }
}
