import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api-base-url.token';

export interface Company {
  id: string;
  code: string;
  name: string;
  ruc: string | null;
  billingEmail: string | null;
  isActive: boolean;
  areaCount: number;
  userCount: number;
}

export interface CompanyInput {
  code: string;
  name: string;
  ruc: string;
  billingEmail: string;
}

export interface Area {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  companyCode: string;
  companyName: string;
  isActive: boolean;
  userCount: number;
}

export interface AreaInput {
  companyId: string;
  name: string;
  description: string;
}

/** Configuración › Sociedades y Áreas, contra `api/admin/companies` y `api/admin/areas`. */
@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly base = `${this.apiBaseUrl}/admin`;

  companies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.base}/companies`);
  }

  saveCompany(id: string | null, input: CompanyInput): Observable<Company> {
    return id
      ? this.http.put<Company>(`${this.base}/companies/${id}`, input)
      : this.http.post<Company>(`${this.base}/companies`, input);
  }

  setCompanyStatus(id: string, isActive: boolean): Observable<Company> {
    return this.http.patch<Company>(`${this.base}/companies/${id}/status`, { isActive });
  }

  areas(): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.base}/areas`);
  }

  saveArea(id: string | null, input: AreaInput): Observable<Area> {
    return id
      ? this.http.put<Area>(`${this.base}/areas/${id}`, input)
      : this.http.post<Area>(`${this.base}/areas`, input);
  }

  setAreaStatus(id: string, isActive: boolean): Observable<Area> {
    return this.http.patch<Area>(`${this.base}/areas/${id}/status`, { isActive });
  }
}
