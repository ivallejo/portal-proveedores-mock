import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { Role, User } from './models';

interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: ApiUser;
}
interface ApiUser {
  id: string;
  email: string;
  companyName: string;
  ruc: string;
  role: Role;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly user = signal<User | null>(null);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  login(username: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email: username, password }).pipe(
      tap((response) => localStorage.setItem('web-proveedores.access-token', response.accessToken)),
      map((response) => this.toUser(response.user)),
      tap((user) => this.user.set(user)),
    );
  }
  register(data: {
    ruc: string;
    email: string;
    company: string;
    password: string;
  }): Observable<User> {
    return this.http
      .post<ApiUser>(`${this.apiUrl}/register`, {
        ruc: data.ruc,
        email: data.email,
        companyName: data.company,
        password: data.password,
      })
      .pipe(map((user) => this.toUser(user)));
  }
  logout(): void {
    localStorage.removeItem('web-proveedores.access-token');
    this.user.set(null);
  }
  private toUser(user: ApiUser): User {
    return { username: user.email, name: user.companyName, role: user.role, providerId: user.ruc };
  }
}
