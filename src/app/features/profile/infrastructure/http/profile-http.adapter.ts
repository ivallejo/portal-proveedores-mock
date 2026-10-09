import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { UpdateProfileCommand } from '../../application/models/update-profile.command';
import { ProfileRepositoryPort } from '../../application/ports/out/profile-repository.port';
import { Profile } from '../../domain/models/profile';
import { ProfileEmailType } from '../../domain/models/profile-email-type';
import { toProfile, toUpdateProfileRequest } from '../mappers/profile.mapper';
import { AddProfileEmailRequestDto } from './dto/add-profile-email-request.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

/** Mi perfil contra `api/profile`. El cambio de contraseña es de la feature auth. */
@Injectable()
export class ProfileHttpAdapter implements ProfileRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/profile`;

  get(): Observable<Profile> {
    return this.map(this.http.get<ProfileResponseDto>(this.base));
  }

  update(command: UpdateProfileCommand): Observable<Profile> {
    return this.map(this.http.put<ProfileResponseDto>(this.base, toUpdateProfileRequest(command)));
  }

  addEmail(email: string, type: ProfileEmailType): Observable<Profile> {
    const body: AddProfileEmailRequestDto = { email, type };
    return this.map(this.http.post<ProfileResponseDto>(`${this.base}/emails`, body));
  }

  resendVerification(emailId: string): Observable<Profile> {
    return this.map(
      this.http.post<ProfileResponseDto>(`${this.base}/emails/${emailId}/verification`, {}),
    );
  }

  makePrimary(emailId: string): Observable<Profile> {
    return this.map(
      this.http.post<ProfileResponseDto>(`${this.base}/emails/${emailId}/primary`, {}),
    );
  }

  removeEmail(emailId: string): Observable<Profile> {
    return this.map(this.http.delete<ProfileResponseDto>(`${this.base}/emails/${emailId}`));
  }

  private map(request: Observable<ProfileResponseDto>): Observable<Profile> {
    return request.pipe(
      map(toProfile),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
