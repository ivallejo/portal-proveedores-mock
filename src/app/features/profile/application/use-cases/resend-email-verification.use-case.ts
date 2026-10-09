import { Observable } from 'rxjs';
import { Profile } from '../../domain/models/profile';
import { ResendEmailVerificationPort } from '../ports/in/resend-email-verification.port';
import { ProfileRepositoryPort } from '../ports/out/profile-repository.port';

export class ResendEmailVerificationUseCase implements ResendEmailVerificationPort {
  constructor(private readonly repository: ProfileRepositoryPort) {}

  execute(emailId: string): Observable<Profile> {
    return this.repository.resendVerification(emailId);
  }
}
