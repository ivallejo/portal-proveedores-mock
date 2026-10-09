import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { NavigationQueryPort } from '../../application/ports/out/navigation-query.port';
import { NavigationItem } from '../../domain/models/navigation-item';
import { toNavigationItem } from '../mappers/menu.mapper';
import { NavigationItemDto } from './dto/navigation-item.dto';

/** Menú de la sesión contra `api/navigation`. */
@Injectable()
export class NavigationHttpAdapter implements NavigationQueryPort {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/navigation`;

  forCurrentUser(): Observable<NavigationItem[]> {
    return this.http
      .get<NavigationItemDto[]>(this.url)
      .pipe(map((items) => items.map(toNavigationItem)));
  }
}
