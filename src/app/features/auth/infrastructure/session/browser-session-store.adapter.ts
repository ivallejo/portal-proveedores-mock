import { Injectable } from '@angular/core';
import { AuthSession } from '../../application/models/auth-session';
import { SessionStorePort } from '../../application/ports/out/session-store.port';
import { AuthenticatedUser } from '../../domain/models/authenticated-user';

const SESSION_KEY = 'portal-proveedores.session';
const TOKEN_KEY = 'web-proveedores.access-token';

/** Sesión en `localStorage` (las mismas claves de siempre, para no cerrar las sesiones abiertas). */
@Injectable()
export class BrowserSessionStoreAdapter implements SessionStorePort {
  load(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      const accessToken = localStorage.getItem(TOKEN_KEY);
      if (!raw || !accessToken) return null;
      return { accessToken, user: JSON.parse(raw) as AuthenticatedUser };
    } catch {
      return null;
    }
  }

  save(session: AuthSession): void {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session.user));
  }

  saveUser(user: AuthenticatedUser): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  accessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}
