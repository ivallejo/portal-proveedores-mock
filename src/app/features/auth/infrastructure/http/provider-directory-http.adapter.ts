import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../../core/config/api-base-url.token';
import { toUserFacingError } from '../../../../core/http/to-user-facing-error';
import { AccessKeyResult } from '../../application/models/access-key-result';
import { ProviderDirectoryPort } from '../../application/ports/out/provider-directory.port';
import { ProviderCandidate } from '../../domain/models/provider-candidate';
import {
  toAccessKeyResult,
  toProviderCandidate,
  toProviderLookupError,
} from '../mappers/provider.mapper';
import { AccessKeyRequestDto } from './dto/access-key-request.dto';
import { AccessKeyResponseDto } from './dto/access-key-response.dto';
import { ProviderLookupRequestDto } from './dto/provider-lookup-request.dto';
import { ProviderLookupResponseDto } from './dto/provider-lookup-response.dto';

/** Registro online: consulta del RUC en SAP y envío del enlace de activación (`api/auth`). */
@Injectable()
export class ProviderDirectoryHttpAdapter implements ProviderDirectoryPort {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(API_BASE_URL)}/auth`;

  lookup(ruc: string): Observable<ProviderCandidate> {
    const body: ProviderLookupRequestDto = { ruc };
    return this.http.post<ProviderLookupResponseDto>(`${this.base}/validate-ruc`, body).pipe(
      map(toProviderCandidate),
      catchError((error: unknown) => throwError(() => toProviderLookupError(error))),
    );
  }

  requestAccessKey(ruc: string, termsAccepted: boolean): Observable<AccessKeyResult> {
    const body: AccessKeyRequestDto = { ruc, termsAccepted };
    return this.http.post<AccessKeyResponseDto>(`${this.base}/request-access-key`, body).pipe(
      map(toAccessKeyResult),
      catchError((error: unknown) => throwError(() => toUserFacingError(error))),
    );
  }
}
