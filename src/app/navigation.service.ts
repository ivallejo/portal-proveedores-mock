import { Injectable, signal } from '@angular/core';

export type Screen =
  | 'dashboard'
  | 'registrar'
  | 'documentos'
  | 'consultas'
  | 'perfil'
  | 'usuarios'
  | 'workflows'
  | 'aprobaciones'
  | 'contabilizacion';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  readonly screen = signal<Screen>('dashboard');

  goTo(screen: Screen): void {
    this.screen.set(screen);
  }
}
