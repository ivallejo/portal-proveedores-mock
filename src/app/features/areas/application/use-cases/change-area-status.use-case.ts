import { Observable } from 'rxjs';
import { Area } from '../../domain/models/area';
import { ChangeAreaStatusPort } from '../ports/in/change-area-status.port';
import { AreaRepositoryPort } from '../ports/out/area-repository.port';

export class ChangeAreaStatusUseCase implements ChangeAreaStatusPort {
  constructor(private readonly repository: AreaRepositoryPort) {}

  execute(id: string, isActive: boolean): Observable<Area> {
    return this.repository.setStatus(id, isActive);
  }
}
