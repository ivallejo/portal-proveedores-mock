import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { CatalogQueryPort } from '../../application/ports/out/catalog-query.port';
import { CatalogArea } from '../../domain/models/catalog-area';
import { CatalogCompany } from '../../domain/models/catalog-company';
import { toCatalogArea, toCatalogCompany } from '../mappers/catalog.mapper';
import { CatalogAreaResponseDto } from './dto/catalog-area-response.dto';
import { CatalogCompanyResponseDto } from './dto/catalog-company-response.dto';

/** Catálogo del usuario contra `api/catalog`. */
@Injectable()
export class CatalogHttpAdapter implements CatalogQueryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/catalog`;

  companies(): Observable<CatalogCompany[]> {
    return this.http.get<CatalogCompanyResponseDto[]>(`${this.base}/companies`).pipe(
      map((companies) => companies.map(toCatalogCompany)),
      catchError(this.fail),
    );
  }

  areas(): Observable<CatalogArea[]> {
    return this.http.get<CatalogAreaResponseDto[]>(`${this.base}/areas`).pipe(
      map((areas) => areas.map(toCatalogArea)),
      catchError(this.fail),
    );
  }

  private readonly fail = (error: unknown) => throwError(() => toUserFacingError(error));
}
