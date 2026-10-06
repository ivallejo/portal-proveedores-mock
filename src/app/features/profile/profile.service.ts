import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type EmailType = 'work' | 'billing' | 'personal';

export interface ProfileEmail {
  id: string;
  email: string;
  type: EmailType;
  isPrimary: boolean;
  isVerified: boolean;
  createdAtUtc: string;
}

export interface Profile {
  username: string;
  isProvider: boolean;
  ruc: string | null;
  displayName: string;
  businessName: string | null;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  areaName: string | null;
  areaCompanyName: string | null;
  companies: { code: string; name: string; ruc: string | null; isActive: boolean }[];
  emails: ProfileEmail[];
  mustChangePassword: boolean;
  createdAtUtc: string;
  updatedAtUtc: string;
  passwordSetAtUtc: string | null;
}

export interface ProfileInput {
  businessName?: string;
  firstName?: string;
  lastName?: string;
}

/** Mi perfil (api/profile). El cambio de contraseña está en AuthService. */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/profile`;

  get(): Observable<Profile> {
    return this.http.get<Profile>(this.base);
  }

  update(input: ProfileInput): Observable<Profile> {
    return this.http.put<Profile>(this.base, input);
  }

  addEmail(email: string, type: EmailType): Observable<Profile> {
    return this.http.post<Profile>(`${this.base}/emails`, { email, type });
  }

  resendVerification(id: string): Observable<Profile> {
    return this.http.post<Profile>(`${this.base}/emails/${id}/verification`, {});
  }

  makePrimary(id: string): Observable<Profile> {
    return this.http.post<Profile>(`${this.base}/emails/${id}/primary`, {});
  }

  removeEmail(id: string): Observable<Profile> {
    return this.http.delete<Profile>(`${this.base}/emails/${id}`);
  }

  /** Enlace del correo de verificación; no requiere sesión. */
  verifyEmail(token: string): Observable<{ email: string }> {
    return this.http.post<{ email: string }>(`${this.base}/emails/verify`, { token });
  }
}
