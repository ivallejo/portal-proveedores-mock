import { Observable } from 'rxjs';
import { Profile } from '../../domain/models/profile';
import { RemoveProfileEmailPort } from '../ports/in/remove-profile-email.port';
import { ProfileRepositoryPort } from '../ports/out/profile-repository.port';

export class RemoveProfileEmailUseCase implements RemoveProfileEmailPort {
  constructor(private readonly repository: ProfileRepositoryPort) {}

  execute(emailId: string): Observable<Profile> {
    return this.repository.removeEmail(emailId);
  }
}
