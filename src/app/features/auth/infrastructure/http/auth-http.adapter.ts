import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { AuthSession } from '../../application/models/auth-session';
import { ChangePasswordCommand } from '../../application/models/change-password.command';
import { ConfirmPasswordLinkCommand } from '../../application/models/confirm-password-link.command';
import { LoginCommand } from '../../application/models/login.command';
import { PasswordResetResult } from '../../application/models/password-reset-result';
import { AuthenticationGatewayPort } from '../../application/ports/out/authentication-gateway.port';
import { toAuthSession, toConfirmPasswordLinkRequest } from '../mappers/auth.mapper';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetResponseDto } from './dto/password-reset-response.dto';

/** Autenticación contra `api/auth`. */
@Injectable()
export class AuthHttpAdapter implements AuthenticationGatewayPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/auth`;

  login(command: LoginCommand): Observable<AuthSession> {
    const body: LoginRequestDto = { identifier: command.identifier, password: command.password };
    return this.http
      .post<AuthResponseDto>(`${this.base}/login`, body)
      .pipe(map(toAuthSession), catchError(this.fail));
  }

  changePassword(command: ChangePasswordCommand): Observable<AuthSession> {
    const body: ChangePasswordRequestDto = {
      currentPassword: command.currentPassword,
      newPassword: command.newPassword,
    };
    return this.http
      .post<AuthResponseDto>(`${this.base}/change-password`, body)
      .pipe(map(toAuthSession), catchError(this.fail));
  }

  /** No se revela si el RUC existe: un 404 se trata como un envío genérico. */
  requestPasswordReset(ruc: string): Observable<PasswordResetResult> {
    const body: PasswordResetRequestDto = { ruc };
    return this.http
      .post<PasswordResetResponseDto>(`${this.base}/password-reset/request`, body)
      .pipe(
        map((response) => ({ sent: true, maskedEmail: response?.maskedEmail ?? '' })),
        catchError((error: unknown) =>
          error instanceof HttpErrorResponse && error.status === 404
            ? of({ sent: true, maskedEmail: '' })
            : this.fail(error),
        ),
      );
  }

  confirmPasswordLink(command: ConfirmPasswordLinkCommand): Observable<void> {
    const endpoint =
      command.purpose === 'activation' ? 'activation/confirm' : 'password-reset/confirm';
    return this.http
      .post<void>(`${this.base}/${endpoint}`, toConfirmPasswordLinkRequest(command))
      .pipe(catchError(this.fail));
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
