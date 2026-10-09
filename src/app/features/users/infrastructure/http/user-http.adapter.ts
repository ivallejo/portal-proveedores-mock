import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { SaveUserCommand } from '../../application/models/save-user.command';
import { UserFilter } from '../../application/models/user-filter';
import { UserRepositoryPort } from '../../application/ports/out/user-repository.port';
import { UserDetail } from '../../domain/models/user-detail';
import { UserPage } from '../../domain/models/user-page';
import { toSaveUserRequest, toUserDetail, toUserPage } from '../mappers/user.mapper';
import { UserDetailResponseDto } from './dto/user-detail-response.dto';
import { UserPageResponseDto } from './dto/user-page-response.dto';

/** Configuración › Usuarios contra `api/admin/users`. */
@Injectable()
export class UserHttpAdapter implements UserRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/users`;

  search(filter: UserFilter, page: number, pageSize: number): Observable<UserPage> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filter.search.trim()) params = params.set('search', filter.search.trim());
    if (filter.role) params = params.set('role', filter.role);
    if (filter.status) params = params.set('status', filter.status);
    return this.http
      .get<UserPageResponseDto>(this.base, { params })
      .pipe(map(toUserPage), catchError(this.fail));
  }

  get(id: string): Observable<UserDetail> {
    return this.http
      .get<UserDetailResponseDto>(`${this.base}/${id}`)
      .pipe(map(toUserDetail), catchError(this.fail));
  }

  create(command: SaveUserCommand): Observable<UserDetail> {
    return this.http
      .post<UserDetailResponseDto>(this.base, toSaveUserRequest(command))
      .pipe(map(toUserDetail), catchError(this.fail));
  }

  update(id: string, command: SaveUserCommand): Observable<UserDetail> {
    return this.http
      .put<UserDetailResponseDto>(`${this.base}/${id}`, toSaveUserRequest(command))
      .pipe(map(toUserDetail), catchError(this.fail));
  }

  setStatus(id: string, isActive: boolean): Observable<UserDetail> {
    return this.http
      .patch<UserDetailResponseDto>(`${this.base}/${id}/status`, { isActive })
      .pipe(map(toUserDetail), catchError(this.fail));
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
