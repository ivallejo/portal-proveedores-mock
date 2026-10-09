import { Observable } from 'rxjs';
import { Profile } from '../../domain/models/profile';
import { MakePrimaryEmailPort } from '../ports/in/make-primary-email.port';
import { ProfileRepositoryPort } from '../ports/out/profile-repository.port';

export class MakePrimaryEmailUseCase implements MakePrimaryEmailPort {
  constructor(private readonly repository: ProfileRepositoryPort) {}

  execute(emailId: string): Observable<Profile> {
    return this.repository.makePrimary(emailId);
  }
}
