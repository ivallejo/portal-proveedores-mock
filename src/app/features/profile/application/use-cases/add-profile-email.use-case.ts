import { Observable } from 'rxjs';
import { Profile } from '../../domain/models/profile';
import { ProfileEmailType } from '../../domain/models/profile-email-type';
import { AddProfileEmailPort } from '../ports/in/add-profile-email.port';
import { ProfileRepositoryPort } from '../ports/out/profile-repository.port';

export class AddProfileEmailUseCase implements AddProfileEmailPort {
  constructor(private readonly repository: ProfileRepositoryPort) {}

  execute(email: string, type: ProfileEmailType): Observable<Profile> {
    return this.repository.addEmail(email, type);
  }
}
