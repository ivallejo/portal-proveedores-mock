import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { SaveMenuCommand } from '../../application/models/save-menu.command';
import { MenuRepositoryPort } from '../../application/ports/out/menu-repository.port';
import { MenuOption } from '../../domain/models/menu-option';
import { toMenuOption, toSaveMenuRequest } from '../mappers/menu.mapper';
import { MenuOptionResponseDto } from './dto/menu-option-response.dto';

/** Configuración › Menús contra `api/admin/menus`. */
@Injectable()
export class MenuHttpAdapter implements MenuRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/admin/menus`;

  list(): Observable<MenuOption[]> {
    return this.http.get<MenuOptionResponseDto[]>(this.base).pipe(
      map((items) => items.map(toMenuOption)),
      catchError(this.fail),
    );
  }

  create(command: SaveMenuCommand): Observable<MenuOption> {
    return this.http
      .post<MenuOptionResponseDto>(this.base, toSaveMenuRequest(command))
      .pipe(map(toMenuOption), catchError(this.fail));
  }

  update(id: string, command: SaveMenuCommand): Observable<MenuOption> {
    return this.http
      .put<MenuOptionResponseDto>(`${this.base}/${id}`, toSaveMenuRequest(command))
      .pipe(map(toMenuOption), catchError(this.fail));
  }

  setStatus(id: string, isActive: boolean): Observable<MenuOption> {
    return this.http
      .patch<MenuOptionResponseDto>(`${this.base}/${id}/status`, { isActive })
      .pipe(map(toMenuOption), catchError(this.fail));
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
