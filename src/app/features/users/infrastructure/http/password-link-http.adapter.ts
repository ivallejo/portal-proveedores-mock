import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { PasswordLinkSent } from '../../application/models/password-link-sent';
import { PasswordLinkGatewayPort } from '../../application/ports/out/password-link-gateway.port';
import { PasswordLink } from '../../domain/models/password-link';
import { toPasswordLink, toPasswordLinkSent } from '../mappers/user.mapper';
import { PasswordLinkResponseDto } from './dto/password-link-response.dto';
import { PasswordLinkSentResponseDto } from './dto/password-link-sent-response.dto';

/** Enlaces de contraseña de un usuario (`api/admin/users/{id}/password-link[s]`). */
@Injectable()
export class PasswordLinkHttpAdapter implements PasswordLinkGatewayPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/users`;

  send(userId: string): Observable<PasswordLinkSent> {
    return this.http
      .post<PasswordLinkSentResponseDto>(`${this.base}/${userId}/password-link`, {})
      .pipe(map(toPasswordLinkSent), catchError(this.fail));
  }

  history(userId: string): Observable<PasswordLink[]> {
    return this.http.get<PasswordLinkResponseDto[]>(`${this.base}/${userId}/password-links`).pipe(
      map((links) => links.map(toPasswordLink)),
      catchError(this.fail),
    );
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
