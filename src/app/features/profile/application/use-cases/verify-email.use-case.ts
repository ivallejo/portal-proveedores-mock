import { Observable } from 'rxjs';
import { VerifiedEmail } from '../../domain/models/verified-email';
import { VerifyEmailPort } from '../ports/in/verify-email.port';
import { EmailVerificationGatewayPort } from '../ports/out/email-verification-gateway.port';

export class VerifyEmailUseCase implements VerifyEmailPort {
  constructor(private readonly gateway: EmailVerificationGatewayPort) {}

  execute(token: string): Observable<VerifiedEmail> {
    return this.gateway.verify(token);
  }
}
