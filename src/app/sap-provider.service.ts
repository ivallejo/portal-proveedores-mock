import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';

export interface SapProvider {
  ruc: string;
  companyName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class SapProviderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  lookupByRuc(ruc: string): Observable<SapProvider> {
    return this.http
      .post<{ ruc: string; companyName: string; maskedEmail: string }>(
        `${this.apiUrl}/validate-ruc`,
        { ruc },
      )
      .pipe(
        map((provider) => ({
          ruc: provider.ruc,
          companyName: provider.companyName,
          email: provider.maskedEmail,
        })),
      );
  }

  requestAccessKey(provider: SapProvider): Observable<{ sent: boolean; email: string }> {
    return this.http
      .post<{ sent: boolean; maskedEmail: string }>(`${this.apiUrl}/request-access-key`, {
        ruc: provider.ruc,
        termsAccepted: true,
      })
      .pipe(map((response) => ({ sent: response.sent, email: response.maskedEmail })));
  }
}
