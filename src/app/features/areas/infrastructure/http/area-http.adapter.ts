import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { SaveAreaCommand } from '../../application/models/save-area.command';
import { AreaRepositoryPort } from '../../application/ports/out/area-repository.port';
import { Area } from '../../domain/models/area';
import { toArea, toSaveAreaRequest } from '../mappers/area.mapper';
import { AreaResponseDto } from './dto/area-response.dto';

/** Configuración › Áreas contra `api/admin/areas`. */
@Injectable()
export class AreaHttpAdapter implements AreaRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/areas`;

  list(): Observable<Area[]> {
    return this.http.get<AreaResponseDto[]>(this.base).pipe(
      map((items) => items.map(toArea)),
      catchError(this.fail),
    );
  }

  create(command: SaveAreaCommand): Observable<Area> {
    return this.http
      .post<AreaResponseDto>(this.base, toSaveAreaRequest(command))
      .pipe(map(toArea), catchError(this.fail));
  }

  update(id: string, command: SaveAreaCommand): Observable<Area> {
    return this.http
      .put<AreaResponseDto>(`${this.base}/${id}`, toSaveAreaRequest(command))
      .pipe(map(toArea), catchError(this.fail));
  }

  setStatus(id: string, isActive: boolean): Observable<Area> {
    return this.http
      .patch<AreaResponseDto>(`${this.base}/${id}/status`, { isActive })
      .pipe(map(toArea), catchError(this.fail));
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
