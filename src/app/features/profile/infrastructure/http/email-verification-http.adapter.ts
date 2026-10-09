import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { EmailVerificationGatewayPort } from '../../application/ports/out/email-verification-gateway.port';
import { VerifiedEmail } from '../../domain/models/verified-email';
import { toVerifiedEmail } from '../mappers/profile.mapper';
import { VerifiedEmailResponseDto } from './dto/verified-email-response.dto';
import { VerifyEmailRequestDto } from './dto/verify-email-request.dto';

/** Enlace «Verificar mi correo» contra `api/profile/emails/verify` (no requiere sesión). */
@Injectable()
export class EmailVerificationHttpAdapter implements EmailVerificationGatewayPort {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/profile/emails/verify`;

  verify(token: string): Observable<VerifiedEmail> {
    const body: VerifyEmailRequestDto = { token };
    return this.http.post<VerifiedEmailResponseDto>(this.url, body).pipe(
      map(toVerifiedEmail),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
