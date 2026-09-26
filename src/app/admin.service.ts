import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AdminUser {
  id: string;
  email: string;
  companyName: string;
  ruc: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/users`;
  list(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(this.url);
  }
  create(data: {
    email: string;
    companyName: string;
    ruc: string;
    password: string;
    role: string;
  }): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.url, data);
  }
  assignRole(id: string, role: string): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.url}/${id}/role`, { role });
  }
  setStatus(id: string, isActive: boolean): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.url}/${id}/status`, { isActive });
  }
}
