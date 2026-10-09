import { Observable } from 'rxjs';
import { Area } from '../../domain/models/area';
import { GetAreasPort } from '../ports/in/get-areas.port';
import { AreaRepositoryPort } from '../ports/out/area-repository.port';

export class GetAreasUseCase implements GetAreasPort {
  constructor(private readonly repository: AreaRepositoryPort) {}

  execute(): Observable<Area[]> {
    return this.repository.list();
  }
}
