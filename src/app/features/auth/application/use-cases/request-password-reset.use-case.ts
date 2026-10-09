import { Observable } from 'rxjs';
import { PasswordResetResult } from '../models/password-reset-result';
import { RequestPasswordResetPort } from '../ports/in/request-password-reset.port';
import { AuthenticationGatewayPort } from '../ports/out/authentication-gateway.port';

export class RequestPasswordResetUseCase implements RequestPasswordResetPort {
  constructor(private readonly gateway: AuthenticationGatewayPort) {}

  execute(ruc: string): Observable<PasswordResetResult> {
    return this.gateway.requestPasswordReset(ruc);
  }
}
