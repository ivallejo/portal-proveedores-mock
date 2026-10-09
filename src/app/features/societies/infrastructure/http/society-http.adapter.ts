import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { SaveSocietyCommand } from '../../application/models/save-society.command';
import { SocietyRepositoryPort } from '../../application/ports/out/society-repository.port';
import { Society } from '../../domain/models/society';
import { toSaveSocietyRequest, toSociety } from '../mappers/society.mapper';
import { SocietyResponseDto } from './dto/society-response.dto';

/** Configuración › Sociedades contra `api/admin/companies`. */
@Injectable()
export class SocietyHttpAdapter implements SocietyRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/companies`;

  list(): Observable<Society[]> {
    return this.http.get<SocietyResponseDto[]>(this.base).pipe(
      map((items) => items.map(toSociety)),
      catchError(this.fail),
    );
  }

  create(command: SaveSocietyCommand): Observable<Society> {
    return this.http
      .post<SocietyResponseDto>(this.base, toSaveSocietyRequest(command))
      .pipe(map(toSociety), catchError(this.fail));
  }

  update(id: string, command: SaveSocietyCommand): Observable<Society> {
    return this.http
      .put<SocietyResponseDto>(`${this.base}/${id}`, toSaveSocietyRequest(command))
      .pipe(map(toSociety), catchError(this.fail));
  }

  setStatus(id: string, isActive: boolean): Observable<Society> {
    return this.http
      .patch<SocietyResponseDto>(`${this.base}/${id}/status`, { isActive })
      .pipe(map(toSociety), catchError(this.fail));
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
