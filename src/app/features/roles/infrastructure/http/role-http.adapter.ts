import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { SaveRoleCommand } from '../../application/models/save-role.command';
import { RoleRepositoryPort } from '../../application/ports/out/role-repository.port';
import { AccessRole } from '../../domain/models/access-role';
import { toAccessRole, toSaveRoleRequest } from '../mappers/role.mapper';
import { RoleResponseDto } from './dto/role-response.dto';

/** Configuración › Roles y permisos contra `api/admin/roles`. */
@Injectable()
export class RoleHttpAdapter implements RoleRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/roles`;

  list(): Observable<AccessRole[]> {
    return this.http.get<RoleResponseDto[]>(this.base).pipe(
      map((items) => items.map(toAccessRole)),
      catchError(this.fail),
    );
  }

  create(command: SaveRoleCommand): Observable<AccessRole> {
    return this.http
      .post<RoleResponseDto>(this.base, toSaveRoleRequest(command))
      .pipe(map(toAccessRole), catchError(this.fail));
  }

  update(id: string, command: SaveRoleCommand): Observable<AccessRole> {
    return this.http
      .put<RoleResponseDto>(`${this.base}/${id}`, toSaveRoleRequest(command))
      .pipe(map(toAccessRole), catchError(this.fail));
  }

  setStatus(id: string, isActive: boolean): Observable<AccessRole> {
    return this.http
      .patch<RoleResponseDto>(`${this.base}/${id}/status`, { isActive })
      .pipe(map(toAccessRole), catchError(this.fail));
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
