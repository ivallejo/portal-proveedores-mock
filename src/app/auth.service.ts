import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Role, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  private readonly accounts: Record<string, User & { password: string }> = {
    proveedor: { username: 'proveedor', password: '1234', name: 'Juan Sebastián', role: 'Proveedor', providerId: 'P-1001' },
    area: { username: 'area', password: '1234', name: 'María Torres', role: 'Área Usuaria' },
    cxp: { username: 'cxp', password: '1234', name: 'Carlos Ramírez', role: 'CxP' },
  };
  login(username: string, password: string): Observable<User> {
    const account = this.accounts[username.toLowerCase()];
    if (!account || account.password !== password) return throwError(() => new Error('Usuario o contraseña inválidos.')).pipe(delay(700));
    const { password: _password, ...user } = account;
    // TODO: reemplazar por llamada HTTP real a /api/auth/login
    return of(user).pipe(delay(700), tap((value) => this.user.set(value)));
  }
  logout(): void { this.user.set(null); }
  demoAccounts(): { username: string; role: Role }[] { return [{ username: 'proveedor', role: 'Proveedor' }, { username: 'area', role: 'Área Usuaria' }, { username: 'cxp', role: 'CxP' }]; }
}
