import { Observable } from 'rxjs';
import { Society } from '../../domain/models/society';
import { GetSocietiesPort } from '../ports/in/get-societies.port';
import { SocietyRepositoryPort } from '../ports/out/society-repository.port';

export class GetSocietiesUseCase implements GetSocietiesPort {
  constructor(private readonly repository: SocietyRepositoryPort) {}

  execute(): Observable<Society[]> {
    return this.repository.list();
  }
}
