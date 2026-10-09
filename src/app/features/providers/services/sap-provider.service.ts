import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';

export interface SapProvider {
  ruc: string;
  companyName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class SapProviderService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  lookupByRuc(ruc: string): Observable<SapProvider> {
    const normalizedRuc = ruc.replace(/\D/g, '');
    return this.http
      .post<ProviderLookupResponse>(`${this.apiBaseUrl}/auth/validate-ruc`, {
        ruc: normalizedRuc,
      })
      .pipe(
        map((provider) => ({
          ruc: provider.ruc,
          companyName: provider.companyName,
          email: provider.maskedEmail,
        })),
      );
  }

  requestAccessKey(
    provider: SapProvider,
    termsAccepted = true,
  ): Observable<{ sent: boolean; email: string }> {
    return this.http
      .post<AccessKeyResponse>(`${this.apiBaseUrl}/auth/request-access-key`, {
        ruc: provider.ruc,
        termsAccepted,
      })
      .pipe(map((response) => ({ sent: response.sent, email: response.maskedEmail })));
  }
}

interface ProviderLookupResponse {
  ruc: string;
  companyName: string;
  maskedEmail: string;
}

interface AccessKeyResponse {
  sent: boolean;
  maskedEmail: string;
}
