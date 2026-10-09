import { Observable } from 'rxjs';
import { Area } from '../../domain/models/area';
import { SaveAreaCommand } from '../models/save-area.command';
import { SaveAreaPort } from '../ports/in/save-area.port';
import { AreaRepositoryPort } from '../ports/out/area-repository.port';

export class SaveAreaUseCase implements SaveAreaPort {
  constructor(private readonly repository: AreaRepositoryPort) {}

  execute(id: string | null, command: SaveAreaCommand): Observable<Area> {
    return id ? this.repository.update(id, command) : this.repository.create(command);
  }
}
