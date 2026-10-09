import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { UserCatalogQueryPort } from '../../application/ports/out/user-catalog-query.port';
import { UserCatalog } from '../../domain/models/user-catalog';
import { toUserCatalog } from '../mappers/user.mapper';
import { UserCatalogResponseDto } from './dto/user-catalog-response.dto';

/** Roles, áreas y sociedades asignables, desde `api/admin/users/catalog`. */
@Injectable()
export class UserCatalogHttpAdapter implements UserCatalogQueryPort {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/admin/users/catalog`;

  catalog(): Observable<UserCatalog> {
    return this.http.get<UserCatalogResponseDto>(this.url).pipe(
      map(toUserCatalog),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
