import { Observable } from 'rxjs';
import { Profile } from '../../domain/models/profile';
import { UpdateProfileCommand } from '../models/update-profile.command';
import { UpdateProfilePort } from '../ports/in/update-profile.port';
import { ProfileRepositoryPort } from '../ports/out/profile-repository.port';

export class UpdateProfileUseCase implements UpdateProfilePort {
  constructor(private readonly repository: ProfileRepositoryPort) {}

  execute(command: UpdateProfileCommand): Observable<Profile> {
    return this.repository.update(command);
  }
}
