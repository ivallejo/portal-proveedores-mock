import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Escritorio: menú lateral completo fijo. */
const DESKTOP_QUERY = '(min-width: 1280px)';
/** Pantallas medianas: rail de íconos (M3 navigation rail); el menú completo se abre encima. */
const RAIL_QUERY = '(min-width: 768px) and (max-width: 1279.98px)';

/** Estado del layout que comparten el shell, el encabezado, el rail y el menú lateral. Se provee en el shell. */
@Injectable()
export class LayoutStateService {
  readonly isDesktop = signal(this.matches(DESKTOP_QUERY, true));
  readonly isRail = signal(this.matches(RAIL_QUERY, false));
  /** En escritorio el menú está visible por defecto; en rail y móvil es un panel que se abre encima. */
  readonly navOpen = signal(this.isDesktop());
  /** Grupo del menú que el rail pidió desplegar al abrir el menú completo. */
  readonly requestedGroup = signal<string | null>(null);

  constructor() {
    // Fuera de escritorio el menú se cierra al navegar.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        if (!this.isDesktop()) this.navOpen.set(false);
      });
    if (typeof window !== 'undefined') {
      window.matchMedia(DESKTOP_QUERY).addEventListener('change', (event) => {
        this.isDesktop.set(event.matches);
        this.navOpen.set(event.matches);
      });
      window.matchMedia(RAIL_QUERY).addEventListener('change', (event) => {
        this.isRail.set(event.matches);
      });
    }
  }

  toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  /** Desde el rail: abre el menú completo con el grupo indicado desplegado. */
  openGroup(code: string): void {
    this.requestedGroup.set(code);
    this.navOpen.set(true);
  }

  private matches(query: string, fallback: boolean): boolean {
    return typeof window === 'undefined' ? fallback : window.matchMedia(query).matches;
  }
}
