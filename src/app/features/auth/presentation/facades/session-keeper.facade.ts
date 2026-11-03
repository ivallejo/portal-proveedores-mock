import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GET_ACCESS_TOKEN, RENEW_SESSION } from '../../di/auth.tokens';
import { tokenExpiresAt } from '../../domain/rules/token-rules';
import { SessionEndReason } from './session-end-reason';
import { SessionFacade } from './session.facade';

const CHECK_EVERY_MS = 30_000;
/** Se renueva cuando al token le quedan menos de 5 minutos… */
const RENEW_BEFORE_MS = 5 * 60_000;
/** …si hubo actividad en los últimos 30; si no, la sesión se cierra por inactividad. */
const IDLE_MS = 30 * 60_000;

/**
 * Mantiene viva la sesión mientras la persona usa el portal: renueva el token antes de que venza y, si no hubo
 * actividad, cierra la sesión y vuelve al login con el motivo.
 */
@Injectable({ providedIn: 'root' })
export class SessionKeeperFacade {
  private readonly session = inject(SessionFacade);
  private readonly router = inject(Router);
  private readonly accessToken = inject(GET_ACCESS_TOKEN);
  private readonly renewSession = inject(RENEW_SESSION);
  private readonly document = inject(DOCUMENT);

  private started = false;
  private renewing = false;
  private lastActivity = Date.now();

  start(): void {
    if (this.started) return;
    this.started = true;
    this.lastActivity = Date.now();
    const touch = () => (this.lastActivity = Date.now());
    for (const event of ['pointerdown', 'keydown', 'wheel', 'touchstart'])
      this.document.addEventListener(event, touch, { passive: true, capture: true });
    setInterval(() => this.check(), CHECK_EVERY_MS);
  }

  /** Revisa el token: lo renueva, lo deja vencer o cierra la sesión. Público para las pruebas. */
  check(now = Date.now()): void {
    const token = this.accessToken.execute();
    const user = this.session.user();
    if (!token || !user || this.renewing) return;
    const expiresAt = tokenExpiresAt(token);
    if (expiresAt === null) return;
    const idle = now - this.lastActivity >= IDLE_MS;
    if (expiresAt <= now) return this.end(idle ? 'inactividad' : 'vencida');
    if (expiresAt - now > RENEW_BEFORE_MS || idle || user.mustChangePassword) return;
    this.renewing = true;
    this.renewSession.execute().subscribe({
      next: () => (this.renewing = false),
      // Un 401 ya lo atiende el interceptor (cierra y avisa); otros errores se reintentan en la próxima revisión.
      error: () => (this.renewing = false),
    });
  }

  private end(reason: SessionEndReason): void {
    const returnUrl = this.router.url;
    this.session.logout();
    void this.router.navigate(['/login'], { queryParams: { sesion: reason, returnUrl } });
  }
}
