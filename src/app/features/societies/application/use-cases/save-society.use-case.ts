import { Observable } from 'rxjs';
import { Society } from '../../domain/models/society';
import { SaveSocietyCommand } from '../models/save-society.command';
import { SaveSocietyPort } from '../ports/in/save-society.port';
import { SocietyRepositoryPort } from '../ports/out/society-repository.port';

export class SaveSocietyUseCase implements SaveSocietyPort {
  constructor(private readonly repository: SocietyRepositoryPort) {}

  execute(id: string | null, command: SaveSocietyCommand): Observable<Society> {
    return id ? this.repository.update(id, command) : this.repository.create(command);
  }
}
