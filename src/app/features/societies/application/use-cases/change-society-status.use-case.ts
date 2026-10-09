import { Observable } from 'rxjs';
import { Society } from '../../domain/models/society';
import { ChangeSocietyStatusPort } from '../ports/in/change-society-status.port';
import { SocietyRepositoryPort } from '../ports/out/society-repository.port';

export class ChangeSocietyStatusUseCase implements ChangeSocietyStatusPort {
  constructor(private readonly repository: SocietyRepositoryPort) {}

  execute(id: string, isActive: boolean): Observable<Society> {
    return this.repository.setStatus(id, isActive);
  }
}
