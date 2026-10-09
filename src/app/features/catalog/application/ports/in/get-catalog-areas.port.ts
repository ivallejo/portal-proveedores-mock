import { Observable } from 'rxjs';
import { CatalogArea } from '../../../domain/models/catalog-area';

export interface GetCatalogAreasPort {
  execute(): Observable<CatalogArea[]>;
}
