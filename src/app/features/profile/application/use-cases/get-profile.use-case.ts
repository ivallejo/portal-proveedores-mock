import { Observable } from 'rxjs';
import { Profile } from '../../domain/models/profile';
import { GetProfilePort } from '../ports/in/get-profile.port';
import { ProfileRepositoryPort } from '../ports/out/profile-repository.port';

export class GetProfileUseCase implements GetProfilePort {
  constructor(private readonly repository: ProfileRepositoryPort) {}

  execute(): Observable<Profile> {
    return this.repository.get();
  }
}
