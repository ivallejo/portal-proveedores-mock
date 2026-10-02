import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SapProvider {
  ruc: string;
  companyName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class SapProviderService {
  private readonly http = inject(HttpClient);

  lookupByRuc(ruc: string): Observable<SapProvider> {
    const normalizedRuc = ruc.replace(/\D/g, '');
    return this.http
      .post<ProviderLookupResponse>(`${environment.apiBaseUrl}/auth/validate-ruc`, {
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
      .post<AccessKeyResponse>(`${environment.apiBaseUrl}/auth/request-access-key`, {
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
